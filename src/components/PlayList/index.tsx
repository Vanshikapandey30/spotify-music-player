import React from 'react';

import useDataFetcher from '../../hooks/useDataFetcher';
import useSpotifyAPIClient from '../../hooks/useSpotifyAPIClient';
import getAllPlaylist, {
  Response,
} from '../../services/spotify/playlist/getAllPlaylist';
import withSuspense from '../HOC/withSuspense';
import PresentPlayList from './PresentPlayList';

export function Playlist() {
  const apiClient = useSpotifyAPIClient();
  const response = useDataFetcher<Response>('me/playlists', () =>
    getAllPlaylist(apiClient),
  );
  return <PresentPlayList items={response.data.items} />;
}

export default withSuspense(Playlist);
