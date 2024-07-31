import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfWorker.bundle.js';

self.addEventListener('message', function(event: MessageEvent<{ arrayBuffer: ArrayBuffer }>) {
  const { arrayBuffer } = event.data;

  pdfjsLib.getDocument({ data: arrayBuffer }).promise.then(function(pdf) {
    const numPages = pdf.numPages;
    let fullText = '';

    const processPage = (pageNum: number) => {
      return pdf.getPage(pageNum).then(page => {
        return page.getTextContent().then(content => {
          const pageText = content.items.map(item => (item as any).str).join(' ');
          fullText += pageText + '\n';
        });
      });
    };

    const promises: Promise<void>[] = [];
    for (let i = 1; i <= numPages; i++) {
      promises.push(processPage(i));
    }

    Promise.all(promises).then(() => {
      self.postMessage({ text: fullText });
    }).catch(err => {
      self.postMessage({ error: err.message });
    });
  }).catch(err => {
    self.postMessage({ error: err.message });
  });
});
