import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-NotesPreview.scss';

const cnClientHubNotesPreview = cn('ClientHub', 'NotesPreview');

type ClientHubNotesPreviewProps = {
  readonly children: ReactNode;
};

export const ClientHubNotesPreview: FC<ClientHubNotesPreviewProps> = ({ children }) => {
  return <span className={cnClientHubNotesPreview()}>{children}</span>;
};
