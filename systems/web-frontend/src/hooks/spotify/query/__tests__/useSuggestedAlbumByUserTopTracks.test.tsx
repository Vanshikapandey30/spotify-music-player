import { createPollyContext } from '../../../../../testHelper/polly/createPollyContext';
import { expect, it } from '../../../../../testHelper/test-runner';
import { renderHook } from '../../../../../testHelper/testing-library/react-hooks';
import { TestApp } from '../../../../App';
import { useSuggestedAlbumByUserTopTracks } from '../useSuggestedAlbumByUserTopTracks';

const _context = createPollyContext(import.meta.url);
it('Return playlist of user by top track', async () => {
  const { result, waitFor } = renderHook(
    () => useSuggestedAlbumByUserTopTracks(),
    {
      wrapper: ({ children }) => <TestApp>{children}</TestApp>,
    },
  );
  await waitFor(() => expect(result.current).toBeDefined());
  expect(result.error).toBeUndefined();
  expect(result.current?.data).toEqual({
    albums: expect.any(Array),
    tracks: expect.any(Array),
  });
});
