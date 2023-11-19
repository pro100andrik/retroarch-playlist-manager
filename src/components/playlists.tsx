import { View, Text, LineEdit, Button } from "@nodegui/react-nodegui";
import React, { useState } from "react";
import { renamePlaylist } from "../utils";
import path from "path";
import { PlaylistsType } from "../TSTypes";

export function Playlists(props: {
  playlists: PlaylistsType[], 
  setPlaylists: Function, 
  createNewPlaylist: Function 
  setCurrentPlaylistInfo: Function,
}) {
 
  const [newPlaylistName, setNewPlaylistName] = useState<string>('')
  const [newPlaylistAdding, setNewPlaylistAdding] = useState<boolean>(false)
  const handlePlaylistNameChanged = (textValue: string) => {
    setNewPlaylistName(textValue)
  }

  const [editingPlaylistName, setEditingPlaylistName] = useState<string>('')
  const [editingPlaylistIndex, setEditingPlaylistIndex] = useState<number>(-1)
  const handleEditingPlaylistNameChanged = (textValue: string) => {
    setEditingPlaylistName(textValue)
  }

  const buttonHandler = (type: string, value?: string | number) => {
    if (type === 'cancelAddingItem'){
      setNewPlaylistAdding(false)
      setNewPlaylistName('')
      return
    }
    if (type === 'addPlaylistItem'){
      props.createNewPlaylist(newPlaylistName) 
      setNewPlaylistName('')
      return
    }
    if (type === 'newPlaylistItem'){
      setNewPlaylistAdding(true)
      return
    }
    if (type === 'editPlaylistName' && typeof value === 'number'){
      setEditingPlaylistName(props.playlists[value].name)
      setEditingPlaylistIndex(value)
      return
    }
    if (type === 'cancelPlaylistRenaming'){
      setEditingPlaylistName('')
      setEditingPlaylistIndex(-1)
      return
    }
    if (type === 'savePlaylistRenaming' && typeof value === 'number'){
      renamePlaylist(props.playlists[editingPlaylistIndex], editingPlaylistName)
      props.setPlaylists((prevState: []) => prevState.map((playlist: PlaylistsType, index: number) => {
        if (index === editingPlaylistIndex){
          playlist.base = editingPlaylistName + '.lpl';
          playlist.name = editingPlaylistName;
          playlist.path = path.join(playlist.dir, editingPlaylistName + '.lpl');
        }
        return playlist
      }))
      setEditingPlaylistName('')
      setEditingPlaylistIndex(-1)
      return
    }
    if (type === 'openPlaylist' && typeof value === 'number'){
      props.setCurrentPlaylistInfo((prevState: object) => Object.assign({}, prevState, props.playlists[value]))
      return
    }

    console.log(type, value)
  };

  return (
    <View id="main-menu-playlists-wrapper">
      <Text> Playlists found in RetroArch folder: {props.playlists.length}</Text>
      {props.playlists.map((playlist: PlaylistsType, index: number) => (
        <View 
          id="main-menu-playlist"
          key={index}
        >
          {index === editingPlaylistIndex ? (
            <View id="main-menu-playlist-control-buttons">
              <Button 
                id="main-menu-playlist-control-button"
                text='Save'
                on={{ clicked: () => buttonHandler("savePlaylistRenaming", index) }}
              />
              <Button
                id="main-menu-playlist-control-button"
                on={{ clicked: () => buttonHandler("cancelPlaylistRenaming", index) }}
                text="Cancel"
              />
            </View>
          ) : (
            <View id="main-menu-playlist-control-buttons">
              <Button
                id="main-menu-playlist-control-button"
                text='Open'
                on={{ clicked: () => buttonHandler("openPlaylist", index) }}
              />
              <Button
                id="main-menu-playlist-control-button"
                on={{ clicked: () => buttonHandler("editPlaylistName", index) }}
                text="Rename"
              />
            </View>
          )}
          {index === editingPlaylistIndex ? (
            <LineEdit
              id="playlists-renaming-line-edit"
              placeholderText='My awesome playlist'
              on={{ textChanged: handleEditingPlaylistNameChanged }}
              text={editingPlaylistName}
            />
          ) : (
            <Text>{playlist.name}</Text>
          )}
          
        </View>
      ))}
      {newPlaylistAdding && (
        <>
          <LineEdit
            placeholderText='My awesome playlist'
            on={{ textChanged: handlePlaylistNameChanged }}
            text={newPlaylistName}
          />
          <Button
            on={{ clicked: () => buttonHandler("addPlaylistItem") }}
            text="Add"
          />
          <Button
            on={{ clicked: () => buttonHandler("cancelAddingItem") }}
            text="Cancel"
          />
        </>
      )}
      <Button
        on={{ clicked: () => buttonHandler("newPlaylistItem") }}
        text="Create New Playlist"
      />
    </View>
  );
}

