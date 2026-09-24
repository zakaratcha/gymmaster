import { type FC } from 'react';

import { truncateNotes } from '../format';
import { ClientHubNotesToggle } from '../NotesToggle/ClientHub-NotesToggle';
import { ClientHubSection } from '../Section/ClientHub-Section';

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
      <ClientHubNotesToggle expanded={expanded} notes={notes} notesPreview={notesPreview} onToggle={onToggle} />
    </ClientHubSection>
  );
};
