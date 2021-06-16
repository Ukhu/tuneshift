import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import PlaylistCard from "./PlaylistCard";
import { formatTitle } from "../../utils/helpers";
import { textMatcher } from "../../utils/testUtils";

const playlist = {
  owner: "John Doe",
  title: "My Ultimate Playlist",
  image: "https://unsplash.com/adhbf3fiy3.jpg",
  tracks: [
    {
      artist: "James Bond",
      title: "Never say never",
    },
  ],
  providerName: "spotify",
  link: "https://playlist.spotify.com/dbd4UW3BVUI",
};

test("Playlist card renders correctly", () => {
  const { container } = render(<PlaylistCard playlist={playlist} />);
  expect(container).toBeInTheDocument();
});

test("Displays the playlist information", () => {
  render(<PlaylistCard playlist={playlist} />);

  const providerName = screen.getByText("Spotify");
  const playlistTitle = screen.getByText(
    textMatcher(`Title: ${formatTitle(playlist.title)}`)
  );
  const playlistOwner = screen.getByText(textMatcher(`By: ${playlist.owner}`));
  const playlistsTracks = screen.getByText(
    textMatcher(`Tracks: ${playlist.tracks.length}`)
  );

  expect(providerName).toBeInTheDocument();
  expect(playlistTitle).toBeInTheDocument();
  expect(playlistOwner).toBeInTheDocument();
  expect(playlistsTracks).toBeInTheDocument();
});

test("Contains the View button when the viewBtn prop is true", () => {
  render(<PlaylistCard playlist={playlist} viewBtn />);

  const viewBtn = screen.getByText("View");
  const convertBtn = screen.queryByText("Clone");

  expect(viewBtn).toBeInTheDocument();
  expect(convertBtn).not.toBeInTheDocument();
});

test("Contains the Clone button when viewBtn is false", () => {
  render(<PlaylistCard playlist={playlist} />);

  const convertBtn = screen.getByText("Clone");
  const viewBtn = screen.queryByText("View");

  expect(convertBtn).toBeInTheDocument();
  expect(viewBtn).not.toBeInTheDocument();
});

test("Calls the convertPlaylist prop when the Clone button is clicked", () => {
  const convert = jest.fn();

  render(<PlaylistCard playlist={playlist} convertPlaylist={convert} />);

  const cloneBtn = screen.getByText("Clone");

  fireEvent.click(cloneBtn);

  expect(convert).toHaveBeenCalledTimes(1);
});
