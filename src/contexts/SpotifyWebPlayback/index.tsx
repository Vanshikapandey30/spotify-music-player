import constate from 'constate';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import type { TrackSimplified } from 'src/hooks/spotify/typings/Track';

import { useSpotifyAPIClient } from '../../hooks/useSpotifyAPIClient';
import { useLocalSpotifyPlayback } from './hooks/useLocalSpotifyPlayback';
import { usePlaybackStateMachine } from './hooks/usePlaybackStateMachine';
import { Command, CommandExecutor } from './typings/Command';
import { PlaybackState, PlaybackType } from './typings/Playback';
import type { RepeatMode } from './typings/RepeatMode';

function useCreateSpotifyWebPlayback() {
  const playbackStateMachine = usePlaybackStateMachine(PlaybackState.INIT);

  const queryClient = useQueryClient();
  const apiClient = useSpotifyAPIClient();

  const { playerError, player } = useLocalSpotifyPlayback({
    onPlayerStateChanged: useCallback(
      state => {
        if (!state) {
          if (playbackStateMachine.can(PlaybackState.PLAY_ON_REMOTE_PLAYBACK))
            playbackStateMachine.playOnRemotePlayback();
        } else {
          if (playbackStateMachine.can(PlaybackState.PLAY_ON_LOCAL_PLAYBACK))
            playbackStateMachine.playOnLocalPlayback();
        }
      },
      [playbackStateMachine],
    ),
  });

  const [isLoading, setIsLoading] = useState(false);

  const playback = playbackStateMachine.getPlayback({
    apiClient,
    localPlayback: player,
  });
  const {
    data: currentPlaybackState,
    error: getPlaybackStateError,
    refetch,
  } = useQuery(
    [playback.playbackType, playbackStateMachine.state, 'getPlaybackState'],
    () => {
      return playback.getPlaybackState();
    },
    {
      refetchInterval: playback.refreshInterval,
      suspense: false,
    },
  );
  const invalidCurrentPlaybackState = useCallback(async () => {
    await queryClient.invalidateQueries([
      playback.playbackType,
      playbackStateMachine.state,
      'getPlaybackState',
    ]);
    await refetch();
  }, [playback.playbackType, playbackStateMachine.state, queryClient, refetch]);
  const localPlaybackId = player?._options.id;
  const playOnDeviceId = currentPlaybackState?.is_active
    ? currentPlaybackState?.device.id
    : localPlaybackId;
  const isLocalDeviceId =
    player?._options.id && playOnDeviceId === player?._options.id;

  const triggerCommandOnPlayback = useCallback<CommandExecutor>(
    async (command: any, payload: any) => {
      if (isLoading) return; // disable concurrent send command to player
      setIsLoading(true);
      await playback.execute(command, payload);
      if (
        isLocalDeviceId &&
        playbackStateMachine.can(PlaybackState.PLAY_ON_LOCAL_PLAYBACK)
      )
        playbackStateMachine.playOnLocalPlayback();
      else await invalidCurrentPlaybackState();
      setIsLoading(false);
    },
    [
      isLoading,
      playback,
      isLocalDeviceId,
      playbackStateMachine,
      invalidCurrentPlaybackState,
    ],
  );

  const startPlayTrackOnUserPlayback = useCallback(
    async (trackUri: string) => {
      await triggerCommandOnPlayback(Command.StartPlayback, {
        uris: [trackUri],
      });
    },
    [triggerCommandOnPlayback],
  );
  const pauseUserPlayback = useCallback(async () => {
    await triggerCommandOnPlayback(Command.PausePlayback);
  }, [triggerCommandOnPlayback]);

  const playNextTrack = useCallback(async () => {
    await triggerCommandOnPlayback(Command.NextTrack);
  }, [triggerCommandOnPlayback]);

  const seekTrack = useCallback(
    async (position_ms: number) => {
      await triggerCommandOnPlayback(Command.SeekPlayback, {
        position_ms: Math.floor(position_ms),
      });
    },
    [triggerCommandOnPlayback],
  );
  const playPreviousTrack = useCallback(async () => {
    if (currentPlaybackState) {
      const { progress_ms } = currentPlaybackState;
      if (progress_ms >= 1000) return seekTrack(0);
    }
    return triggerCommandOnPlayback(Command.PreviousTrack);
  }, [triggerCommandOnPlayback, currentPlaybackState, seekTrack]);
  const togglePlayMode = useCallback(async () => {
    if (!currentPlaybackState) return;
    const { is_paused, is_active, track } = currentPlaybackState;
    if (!is_active) {
      if (track.track_number) {
        await triggerCommandOnPlayback(Command.StartPlayback, {
          context_uri: track.album.uri,
          offset: {
            position: track.track_number - 1,
          },
        });
      } else {
        await triggerCommandOnPlayback(Command.StartPlayback, {
          uris: [track.uri],
        });
      }
      return;
    }
    if (is_paused) {
      await triggerCommandOnPlayback(Command.ResumePlayback);
    } else {
      await triggerCommandOnPlayback(Command.PausePlayback);
    }
  }, [currentPlaybackState, triggerCommandOnPlayback]);
  const toggleShuffleMode = useCallback(async () => {
    if (!currentPlaybackState) return;
    await triggerCommandOnPlayback(Command.SetShuffleMode, {
      shouldPlayOnShuffleMode: !currentPlaybackState.shuffle_state,
    });
  }, [triggerCommandOnPlayback, currentPlaybackState]);
  const changeRepeatMode = useCallback(
    async (newMode: RepeatMode) => {
      await triggerCommandOnPlayback(Command.SetRepeatMode, {
        repeatMode: newMode,
      });
    },
    [triggerCommandOnPlayback],
  );

  const setVolume = useCallback(
    (volume: number) =>
      triggerCommandOnPlayback(Command.SetVolume, {
        volume: Math.floor(volume),
      }),
    [triggerCommandOnPlayback],
  );

  const transferPlayback = useCallback(
    async (targetPlaybackDeviceId: string) => {
      if (!playOnDeviceId) return;
      if (isLoading) return; // disable concurrent send command to player
      setIsLoading(true);
      await apiClient.request({
        data: {
          device_ids: [targetPlaybackDeviceId],
          play: true,
        },
        method: 'PUT',
        url: 'me/player',
      });
      setIsLoading(false);
      if (
        targetPlaybackDeviceId === localPlaybackId &&
        playbackStateMachine.can(PlaybackState.PLAY_ON_LOCAL_PLAYBACK)
      )
        playbackStateMachine.playOnLocalPlayback();
      else if (playbackStateMachine.can(PlaybackState.PLAY_ON_REMOTE_PLAYBACK))
        playbackStateMachine.playOnRemotePlayback();
    },
    [
      apiClient,
      isLoading,
      localPlaybackId,
      playOnDeviceId,
      playbackStateMachine,
    ],
  );

  return {
    data: {
      changeRepeatMode,
      currentPlaybackDevice: currentPlaybackState?.device,
      currentPlayingTrack: currentPlaybackState?.track,
      isActive: currentPlaybackState?.is_active ?? false,
      isPaused: currentPlaybackState?.is_paused,
      pauseUserPlayback,
      playNextTrack,
      playPreviousTrack,
      playTrackOnUserPlayback: (track: TrackSimplified) =>
        startPlayTrackOnUserPlayback(track.uri),
      playbackDisallowedActions: currentPlaybackState?.actions.disallows,
      playbackEnabledShuffle: currentPlaybackState?.shuffle_state,
      playbackRepeatMode: currentPlaybackState?.repeat_state,
      playbackState: playbackStateMachine.state,
      playbackType: playback.playbackType,
      progressMS: currentPlaybackState?.progress_ms,
      seekTrack,
      setVolume,
      togglePlayMode,
      toggleShuffleMode,
      transferPlayback,
      volumePercent: currentPlaybackState?.device.volume_percent,
    },
    error: playerError || getPlaybackStateError,
    isLoading,
  };
}

const [SpotifyWebPlaybackProvider, useSpotifyWebPlayback] = constate(
  useCreateSpotifyWebPlayback,
);

export {
  PlaybackState,
  PlaybackType,
  SpotifyWebPlaybackProvider,
  useSpotifyWebPlayback,
};
