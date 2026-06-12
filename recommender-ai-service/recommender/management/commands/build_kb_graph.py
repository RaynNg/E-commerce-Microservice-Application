"""
Management command: python manage.py build_kb_graph

Phase 1 — CSV-based graph (user behavior from data_user500.csv):
  (:User  {id})
  (:Product {id})
  (User)-[:VIEWED | :CLICKED | :ADDED_TO_CART {timestamp}]->(Product)
  (Product)-[:CO_PURCHASED_WITH {count}]->(Product)
  (Product)-[:CO_VIEWED_WITH    {count}]->(Product)

Phase 2 — Service-based graph (from comment-rate-service & book-service):
  (:Customer {id})
  (:Book     {id, title, catalog_id, price})
  (Customer)-[:RATED {rating, comment, created_at}]->(Book)
  (Book)-[:SIMILAR_TO {score}]->(Book)   # Jaccard index on co-raters
"""

import csv
import os
import time
from collections import defaultdict
from django.core.management.base import BaseCommand

NEO4J_URI      = os.environ.get("NEO4J_URI",      "bolt://neo4j:7687")
NEO4J_USER     = os.environ.get("NEO4J_USER",     "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "bookstore123")

COMMENT_SERVICE_URL = os.environ.get("COMMENT_SERVICE_URL", "http://comment-rate-service:8000")
BOOK_SERVICE_URL    = os.environ.get("BOOK_SERVICE_URL",    "http://book-service:8000")

CSV_CANDIDATES = [
    "/app/data_user500.csv",
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data_user500.csv"),
]

ACTION_TO_REL = {
    "view":        "VIEWED",
    "click":       "CLICKED",
    "add_to_cart": "ADDED_TO_CART",
}

MAX_RETRIES = 3
RETRY_DELAY = 10


class Command(BaseCommand):
    help = "Build Neo4j Knowledge Base Graph (CSV behavior + service ratings)"

    def handle(self, *args, **options):
        driver = self._connect_neo4j()
        if not driver:
            return

        self.stdout.write("Building graph…")
        with driver.session() as s:
            self._clear(s)
            self._create_indexes(s)

            # Phase 1: CSV-based user behavior graph
            csv_path = next((p for p in CSV_CANDIDATES if os.path.exists(p)), None)
            if csv_path:
                self.stdout.write(f"[Phase 1] CSV: {csv_path}")
                rows = self._load_csv(csv_path)
                self._create_nodes_and_rels(s, rows)
                self._add_co_relationships(s)
            else:
                self.stdout.write(self.style.WARNING("[Phase 1] data_user500.csv not found — skipping"))

            # Phase 2: Service-based Customer/Book/RATED/SIMILAR_TO graph
            self.stdout.write("[Phase 2] Fetching books from book-service…")
            books = self._fetch_with_retry(f"{BOOK_SERVICE_URL}/api/books/", params={"limit": 500})
            if isinstance(books, dict):
                books = books.get("results", [])

            self.stdout.write("[Phase 2] Fetching ratings from comment-rate-service…")
            ratings = self._fetch_with_retry(f"{COMMENT_SERVICE_URL}/api/comments/all_ratings/")

            if books:
                self._create_book_nodes(s, books)
            if ratings:
                self._create_customer_and_rated(s, ratings)
            if books and ratings:
                self._create_similar_to(s, ratings)

        driver.close()
        self.stdout.write(self.style.SUCCESS("KB Graph built successfully!"))

    # ── Neo4j connection with retry ──────────────────────────────────────────

    def _connect_neo4j(self):
        from neo4j import GraphDatabase
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
                driver.verify_connectivity()
                self.stdout.write(f"Neo4j connected (attempt {attempt})")
                return driver
            except Exception as e:
                self.stderr.write(f"Neo4j connection failed (attempt {attempt}/{MAX_RETRIES}): {e}")
                if attempt < MAX_RETRIES:
                    self.stdout.write(f"Retrying in {RETRY_DELAY}s…")
                    time.sleep(RETRY_DELAY)
        return None

    # ── HTTP fetch with retry ────────────────────────────────────────────────

    def _fetch_with_retry(self, url, params=None):
        import requests
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                r = requests.get(url, params=params, timeout=15)
                if r.status_code == 200:
                    return r.json()
                self.stderr.write(f"HTTP {r.status_code} from {url}")
            except Exception as e:
                self.stderr.write(f"Fetch error (attempt {attempt}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES:
                self.stdout.write(f"Retrying {url} in {RETRY_DELAY}s…")
                time.sleep(RETRY_DELAY)
        return []

    # ── Graph operations ─────────────────────────────────────────────────────

    def _clear(self, session):
        self.stdout.write("Clearing existing graph…")
        session.run("MATCH (n) DETACH DELETE n")

    def _create_indexes(self, session):
        session.run("CREATE INDEX user_idx     IF NOT EXISTS FOR (u:User)     ON (u.id)")
        session.run("CREATE INDEX prod_idx     IF NOT EXISTS FOR (p:Product)  ON (p.id)")
        session.run("CREATE INDEX cust_idx     IF NOT EXISTS FOR (c:Customer) ON (c.id)")
        session.run("CREATE INDEX book_idx     IF NOT EXISTS FOR (b:Book)     ON (b.id)")

    # ── Phase 1: CSV ─────────────────────────────────────────────────────────

    def _load_csv(self, path):
        with open(path, newline="", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        self.stdout.write(f"  Loaded {len(rows)} rows from CSV")
        return rows

    def _create_nodes_and_rels(self, session, rows):
        self.stdout.write("  Creating User/Product nodes and action relationships…")
        for i, row in enumerate(rows):
            uid = row["user_id"]
            pid = row["product_id"]
            act = row["action"]
            ts  = row["timestamp"]
            rel = ACTION_TO_REL.get(act, "INTERACTED")

            session.run(
                f"""
                MERGE (u:User {{id: $uid}})
                MERGE (p:Product {{id: $pid}})
                CREATE (u)-[:{rel} {{timestamp: $ts, action: $act}}]->(p)
                """,
                uid=uid, pid=pid, ts=ts, act=act,
            )

            if (i + 1) % 500 == 0:
                self.stdout.write(f"    {i + 1}/{len(rows)} rows processed")

        self.stdout.write(f"  All {len(rows)} rows inserted")

    def _add_co_relationships(self, session):
        self.stdout.write("  Building co-purchase relationships…")
        session.run("""
            MATCH (u:User)-[:ADDED_TO_CART]->(p1:Product),
                  (u)-[:ADDED_TO_CART]->(p2:Product)
            WHERE p1.id < p2.id
            WITH p1, p2, count(u) AS co
            WHERE co >= 2
            MERGE (p1)-[r:CO_PURCHASED_WITH]->(p2)
            ON CREATE SET r.count = co
            ON MATCH  SET r.count = co
        """)

        self.stdout.write("  Building co-view relationships…")
        session.run("""
            MATCH (u:User)-[:VIEWED]->(p1:Product),
                  (u)-[:VIEWED]->(p2:Product)
            WHERE p1.id < p2.id
            WITH p1, p2, count(u) AS co
            WHERE co >= 3
            MERGE (p1)-[r:CO_VIEWED_WITH]->(p2)
            ON CREATE SET r.count = co
            ON MATCH  SET r.count = co
        """)
        self.stdout.write("  Co-relationships done")

    # ── Phase 2: Service data ────────────────────────────────────────────────

    def _create_book_nodes(self, session, books):
        self.stdout.write(f"  Creating {len(books)} Book nodes…")
        for book in books:
            session.run(
                """
                MERGE (b:Book {id: $id})
                SET b.title      = $title,
                    b.catalog_id = $catalog_id,
                    b.price      = $price
                """,
                id=str(book.get("id", "")),
                title=book.get("title", ""),
                catalog_id=str(book.get("catalog_id", "")),
                price=float(book.get("price", 0)),
            )
        self.stdout.write(f"  {len(books)} Book nodes created")

    def _create_customer_and_rated(self, session, ratings):
        self.stdout.write(f"  Creating Customer nodes and {len(ratings)} RATED edges…")
        for r in ratings:
            customer_id = str(r.get("customer_id", ""))
            book_id     = str(r.get("book_id", ""))
            rating      = float(r.get("rating", 0))
            comment     = r.get("comment", "") or ""
            created_at  = str(r.get("created_at", ""))

            session.run(
                """
                MERGE (c:Customer {id: $cid})
                MERGE (b:Book {id: $bid})
                CREATE (c)-[:RATED {rating: $rating, comment: $comment, created_at: $created_at}]->(b)
                """,
                cid=customer_id,
                bid=book_id,
                rating=rating,
                comment=comment,
                created_at=created_at,
            )
        self.stdout.write(f"  {len(ratings)} RATED edges created")

    def _create_similar_to(self, session, ratings):
        """Jaccard similarity between books sharing co-raters."""
        self.stdout.write("  Computing SIMILAR_TO edges (Jaccard index)…")

        book_raters = defaultdict(set)
        for r in ratings:
            book_raters[str(r.get("book_id", ""))].add(str(r.get("customer_id", "")))

        books = list(book_raters.keys())
        edge_count = 0
        for i in range(len(books)):
            for j in range(i + 1, len(books)):
                a, b = books[i], books[j]
                raters_a = book_raters[a]
                raters_b = book_raters[b]
                intersection = len(raters_a & raters_b)
                if intersection == 0:
                    continue
                union = len(raters_a | raters_b)
                score = round(intersection / union, 4)
                if score >= 0.1:
                    session.run(
                        """
                        MATCH (b1:Book {id: $a}), (b2:Book {id: $b})
                        MERGE (b1)-[r:SIMILAR_TO]->(b2)
                        SET r.score = $score
                        """,
                        a=a, b=b, score=score,
                    )
                    edge_count += 1

        self.stdout.write(f"  {edge_count} SIMILAR_TO edges created")
