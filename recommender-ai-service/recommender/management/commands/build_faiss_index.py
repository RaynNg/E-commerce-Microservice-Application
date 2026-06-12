from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Build FAISS vector index từ ProductIndex table'

    def handle(self, *args, **options):
        self.stdout.write('Building FAISS index...')
        try:
            from recommender.services.rag_service import RAGService
            rag = RAGService.get_instance()
            rag.build_index()
            self.stdout.write(self.style.SUCCESS('FAISS index đã build xong!'))
        except Exception as e:
            self.stderr.write(f'Lỗi build FAISS index: {e}')
