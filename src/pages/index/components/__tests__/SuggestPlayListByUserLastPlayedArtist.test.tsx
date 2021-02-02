import { render, screen } from '@testing-library/react';
import event from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import { TestApp } from '../../../../App';
import { useSuggestedAlbumByUserLastPlayedArtists } from '../../../../hooks/spotify/query/useSuggestedAlbumByUserLastPlayedArtists';
import type { Props } from '../Present/PresentSuggestPlayList';
import { withSuggestAlbumByUserLastPlayedArtists } from '../SuggestAlbumByUserLastPlayedArtists';

jest.mock(
  '../../../../hooks/spotify/query/useSuggestedPlayListByUserLastPlayedArtist',
);

const SuggestPlayListByLastPlayedArtist = withSuggestAlbumByUserLastPlayedArtists(
  ({ onClickSuggestion, suggestions, title }: Props) => {
    return (
      <div>
        <h1>{title}</h1>
        {suggestions?.map(suggestion => {
          return (
            <button
              key={suggestion.id}
              onClick={() => onClickSuggestion(suggestion)}
            >
              Dummy
            </button>
          );
        })}
      </div>
    );
  },
);

describe('Test SuggestPlayListByLastPlayedArtist component', () => {
  it('have title', () => {
    (useSuggestedAlbumByUserLastPlayedArtists as any).mockReturnValue({
      data: {
        artist: { name: 'artist' },
        playlists: [
          {
            id: 'example-playlist',
          },
        ],
      },
    });
    render(
      <TestApp>
        <SuggestPlayListByLastPlayedArtist />
      </TestApp>,
    );
    expect(screen.getByText('Continue with artist')).toBeVisible();
  });

  it('Click suggestion should jump to /playlist/:id', () => {
    (useSuggestedAlbumByUserLastPlayedArtists as any).mockReturnValue({
      data: {
        artist: { name: 'artist' },
        playlists: [
          {
            id: 'example-playlist',
          },
        ],
      },
    });
    const history = createMemoryHistory();
    render(
      <TestApp RouterProps={{ history }}>
        <SuggestPlayListByLastPlayedArtist />
      </TestApp>,
    );
    expect(screen.getByRole('button')).toBeVisible();
    event.click(screen.getByRole('button'));
    expect(history.entries[1].pathname).toEqual('/playlist/example-playlist');
  });
});
