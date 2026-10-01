"""Extract local PDFs for review. Never publishes full document text."""
from pathlib import Path
import json
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
cache = root / '.index-work'
index = json.loads((root / 'catalog-index.json').read_text(encoding='utf-8'))
results = []
for document in index['documents']:
    name = document.get('localPdf')
    if not name:
        continue
    try:
        reader = PdfReader(cache / name)
        pages = [{'page': i + 1, 'text': page.extract_text() or ''}
                 for i, page in enumerate(reader.pages)]
        output = cache / (document['sha256'] + '.text.json')
        output.write_text(json.dumps({'source': document['url'], 'pages': pages},
                                    ensure_ascii=False, indent=2), encoding='utf-8')
        results.append({'id': document['id'], 'pages': len(pages), 'state': 'needs-human-review'})
        print(document['title'], ':', len(pages), 'pages extracted; awaiting review')
    except Exception as exc:
        results.append({'id': document['id'], 'state': 'failed', 'error': str(exc)})
(cache / 'extraction-report.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
