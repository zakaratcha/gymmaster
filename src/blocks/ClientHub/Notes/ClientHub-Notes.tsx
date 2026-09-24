import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { truncateNotes } from '../format';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSectionLabel } from '../SectionLabel/ClientHub-SectionLabel';

import './ClientHub-Notes.scss';

const cnClientHub = cn('ClientHub');

type ClientHubNotesProps = {
  readonly expanded: boolean;
  readonly notes: string;
  onToggle(): void;
};

export const ClientHubNotes: FC<ClientHubNotesProps> = ({ expanded, notes, onToggle }) => {
  const hasNotes = notes.length > 0;
  const notesPreview = hasNotes ? truncateNotes(notes, 60) : 'Нет заметок';

  return (
    <ClientHubSection type='notes'>
      <button aria-expanded={expanded} className={cnClientHub('NotesToggle')} onClick={onToggle} type='button'>
        <ClientHubSectionLabel>Заметки</ClientHubSectionLabel>
        <span className={cnClientHub('NotesPreview')}>{expanded && hasNotes ? notes : notesPreview}</span>
      </button>
    </ClientHubSection>
  );
};
