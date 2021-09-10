import { renderHook } from '@testing-library/react-hooks';

import { createPollyContext } from '../../../../../testHelper/polly/createPollyContext';
import { TestApp } from '../../../../App';
import { useFeaturedPlaylists } from '../useFeaturedPlaylists';

createPollyContext();
describe('useFeaturedPlaylists', () => {
  it('get featured playlist', async () => {
    const { result, waitFor } = renderHook(() => useFeaturedPlaylists(), {
      wrapper: ({ children }) => <TestApp>{children}</TestApp>,
    });
    await waitFor(() => expect(result.current?.data).toBeDefined());
    expect(result.current?.data).toStrictEqual({
      message: expect.any(String),
      playlists: expect.any(Object),
    });
  });
});
