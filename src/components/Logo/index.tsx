import styled from 'styled-components';

import logo from './Spotify_Logo_RGB_White.png';

const Anchor = styled.a`
  display: block;
  padding: 0px ${props => props.theme.spaces.xxl}
    ${props => props.theme.spaces.l} ${props => props.theme.spaces.xxl};
  max-width: 100%;
`;

const LogoImg = styled.img`
  display: block;
  width: 100%;
`;

export function Logo() {
  return (
    <Anchor href="https://open.spotify.com/">
      <LogoImg src={logo} />
    </Anchor>
  );
}
