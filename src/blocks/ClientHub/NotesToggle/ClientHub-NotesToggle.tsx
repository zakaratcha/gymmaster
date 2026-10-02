import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { ClientHubNotesPreview } from '../NotesPreview/ClientHub-NotesPreview';
import { ClientHubSectionLabel } from '../SectionLabel/ClientHub-SectionLabel';

import './ClientHub-NotesToggle.scss';

const cnClientHubNotesToggle = cn('ClientHub', 'NotesToggle');

type ClientHubNotesToggleProps = {
  readonly expanded: boolean;
  readonly notes: string;
  readonly notesPreview: string;
  onToggle(): void;
};

export const ClientHubNotesToggle: FC<ClientHubNotesToggleProps> = ({ expanded, notes, notesPreview, onToggle }) => {
  return (
    <button aria-expanded={expanded} className={cnClientHubNotesToggle()} onClick={onToggle} type='button'>
      <ClientHubSectionLabel>Заметки</ClientHubSectionLabel>
      <ClientHubNotesPreview>{expanded && notes.length > 0 ? notes : notesPreview}</ClientHubNotesPreview>
    </button>
  );
};
