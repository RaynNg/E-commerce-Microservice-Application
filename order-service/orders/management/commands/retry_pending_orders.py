"""
Management command: python manage.py retry_pending_orders

Finds orders stuck in "payment_pending_retry" status and attempts to
re-run the saga. Can be run manually or via a cron job.
"""
import logging
from django.core.management.base import BaseCommand
from orders.models import Order
from orders.saga import OrderSagaOrchestrator

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Retry orders stuck in payment_pending_retry status"

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=50,
            help="Maximum number of orders to retry in one run (default: 50)",
        )

    def handle(self, *args, **options):
        limit = options["limit"]
        pending = Order.objects.filter(status="payment_pending_retry").order_by("created_at")[:limit]

        if not pending:
            self.stdout.write("No orders pending retry.")
            return

        self.stdout.write(f"Found {len(pending)} order(s) to retry.")
        succeeded = 0
        failed = 0

        for order in pending:
            self.stdout.write(f"  Retrying order #{order.id}…")
            order_items = [
                {"book_id": item.book_id, "quantity": item.quantity, "price": float(item.price)}
                for item in order.items.all()
            ]
            try:
                order, error = OrderSagaOrchestrator().execute(
                    order,
                    order_items,
                    order.customer_id,
                    order.payment_method,
                    order.shipping_method,
                    order.shipping_address,
                )
                if error:
                    self.stderr.write(f"    Failed: {error}")
                    failed += 1
                else:
                    self.stdout.write(self.style.SUCCESS(f"    Order #{order.id} confirmed."))
                    succeeded += 1
            except Exception as exc:
                logger.error("Retry failed for order %s: %s", order.id, exc)
                self.stderr.write(f"    Exception: {exc}")
                failed += 1

        self.stdout.write(
            self.style.SUCCESS(f"Done: {succeeded} succeeded, {failed} failed.")
        )
