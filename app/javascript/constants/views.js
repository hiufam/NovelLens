import { DocViewer } from '../views/doc-viewer';
import { TranslatorViewer } from '../views/translator-viewer';
import { ImagesViewer } from '../views/images-viewer';
import { WikiViewer } from '../views/wiki-viewer';

export const resizerSize = 12.0;

export const viewerMap = {
  'doc-viewer': {
    name: 'Document Viewer',
    class: DocViewer,
  },
  'translator-viewer': {
    name: 'Translator Viewer',
    class: TranslatorViewer,
  },
  'images-viewer': {
    name: 'Images Viewer',
    class: ImagesViewer,
  },
  'wiki-viewer': {
    name: 'Wiki Viewer',
    class: WikiViewer,
  },
}
