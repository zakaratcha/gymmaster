import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { truncateNotes } from '../../../services/util/format/format';
import { ClientHubNotesToggle } from '../NotesToggle/ClientHub-NotesToggle';
import { ClientHubSection } from '../Section/ClientHub-Section';

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
    <ClientHubSection className={cnClientHub('Notes')} type='notes'>
      <ClientHubNotesToggle expanded={expanded} notes={notes} notesPreview={notesPreview} onToggle={onToggle} />
    </ClientHubSection>
  );
};
