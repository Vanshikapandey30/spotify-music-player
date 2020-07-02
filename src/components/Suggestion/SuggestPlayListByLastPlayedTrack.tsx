import React from 'react';

import useDataFetcher from '../../hooks/useDataFetcher';
import useSpotifyAPIClient from '../../hooks/useSpotifyAPIClient';
import searchPlayListByLastPlayedTrack from '../../services/spotify/search/searchPlayListByLastPlayedTrack';
import withSuspense from '../HOC/withSuspense';
import PresentSuggestionList from './Present/PresentSuggestionList';

export function SuggestPlayListByLastPlayedTrack() {
  const apiClient = useSpotifyAPIClient();
  const response = useDataFetcher(
    ['search/playlist', 'by-last-played-track'],
    () => searchPlayListByLastPlayedTrack(apiClient),
  );

  return (
    <PresentSuggestionList
      title={`More like ${response.data.track?.name}`}
      suggestions={response.data.playlists}
      data-testid="playlist-by-last-played-track"
    />
  );
}

export default withSuspense(SuggestPlayListByLastPlayedTrack);
