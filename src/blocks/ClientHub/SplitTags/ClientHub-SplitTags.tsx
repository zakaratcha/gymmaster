import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { ClientHubSplitTag } from '../SplitTag/ClientHub-SplitTag';

import './ClientHub-SplitTags.scss';

const cnClientHubSplitTags = cn('ClientHub', 'SplitTags');

type ClientHubSplitTagsProps = {
  readonly tags: readonly string[];
};

export const ClientHubSplitTags: FC<ClientHubSplitTagsProps> = ({ tags }) => {
  return (
    <ul className={cnClientHubSplitTags()}>
      {tags.map(tag => (
        <ClientHubSplitTag key={tag}>{tag}</ClientHubSplitTag>
      ))}
    </ul>
  );
};
