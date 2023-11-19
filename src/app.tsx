import { Text, Window, hot, View, Button, useEventHandler } from "@nodegui/react-nodegui";
import React, { useEffect, useRef, useState, MutableRefObject } from "react";
import { QIcon, QMainWindowSignals, WidgetEventTypes, QMainWindow } from "@nodegui/nodegui";
import { ChoseFolder } from "./components/choseFolder";
import { Playlists } from "./components/playlists";
import { PlaylistEditor } from "./components/playlistEditor";
import nodeguiIcon from "../assets/retroarch.png";
import { createEmptyPlaylist, getPlaylists, getPlaylistJSON, getConfigFromDrive, writeConfigToDrive, coresFilterTypes, coresSortTypes } from "./utils";
import path from "path";
import { RComboBox } from "./components/RComboBox";
import { styleSheet } from "./components/styleSheet"
import Settings from "./components/settings";
const _ = require('lodash');
import { PlaylistData, PlaylistsType, appConfig } from "./TSTypes";

// createWindow(['item 0', 'item 1', 'item 2', 'item 3'])

const appPath = process.cwd()
const appConfigPath = path.join(appPath, 'config.json')

const defaultAppConfig = {
  advancedRomFields: false,
  hideNonInstalledCores: true,
  coresFilterType: coresFilterTypes.installed,
  coresSortType: coresSortTypes.az,
  windowGeometry: {
    windowSize: {
      width: 500,
      height: 800,
    },
    windowPosition: {
      x: 0,
      y: 0,
    }
  }
}
const minSize = { width: 500, height: 800 };


const appConfigFromDrive = getConfigFromDrive(appConfigPath)
if (!appConfigFromDrive){
  writeConfigToDrive(appConfigPath, defaultAppConfig)
}

const appConfigOnLoad = appConfigFromDrive ? _.cloneDeep(appConfigFromDrive) : _.cloneDeep(defaultAppConfig)


const winIcon = new QIcon(nodeguiIcon);
const App = () => {


  const [appConfig, setAppConfig] = useState(_.cloneDeep(appConfigOnLoad))
  const [showSettings, setShowSettings] = useState(false)


  const [retroArchFolderPath, setRetroArchFolderPath] = useState<string>('E:\\Games\\SteamLibrary\\steamapps\\common\\RetroArch')
  // const [retroArchFolderPath, setRetroArchFolderPath] = useState<string>('')
  // TODO: add check to correct RetroArch folder
  const playlistFolderPath = (retroArchFolderPath !== '' && retroArchFolderPath !== undefined) ? path.join(retroArchFolderPath, 'playlists') : '';
  const coresPath = (retroArchFolderPath !== '' && retroArchFolderPath !== undefined) ? path.join(retroArchFolderPath, 'cores') : '';


  const [ROMSFolderPath, setROMSFolderPath] = useState<string>('')
  const [currentPlaylistInfo, setCurrentPlaylistInfo] = useState<PlaylistsType | any>({})  // FIXME: any type 
  const [currentPlaylistData, setCurrentPlaylistData] = useState<PlaylistData | any>({})  // FIXME: any type

  // TODO: add refresh playlists button
  const createNewPlaylist = (playlistName: string) => {
    createEmptyPlaylist(path.join(playlistFolderPath, playlistName + '.lpl'))
    setPlaylists(getPlaylists(playlistFolderPath))
  }

  const [playlists, setPlaylists] = useState<PlaylistsType[] | []>([])

  useEffect(() => {
    if (playlistFolderPath !== ''){
      setPlaylists(getPlaylists(playlistFolderPath))
    }
  }, [playlistFolderPath])

  useEffect(() => {
    console.log(currentPlaylistInfo?.path)
    if (currentPlaylistInfo?.path !== '' && currentPlaylistInfo?.path !== undefined){
      setCurrentPlaylistData((prevState: object) => ({
        ...prevState,
        ...getPlaylistJSON(currentPlaylistInfo.path)
      }))
    } else {
      setCurrentPlaylistData(() =>({}))
    }
  }, [currentPlaylistInfo?.path])

  const mainWindowRef = useRef<QMainWindow>(null)

  const timeoutRef = useRef<any | ReturnType<typeof setTimeout>>(null)  // FIXME: timeout type

  const mainWindowGeometryChangesCount = useRef(0)

  useEffect(() => {
    if (mainWindowGeometryChangesCount.current < 2){
      mainWindowGeometryChangesCount.current++;
      return () => {}
    } 
    if (timeoutRef.current){
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      console.log('Changes saved')
      writeConfigToDrive(appConfigPath, appConfig)
    }, 2000);
    return () => clearTimeout(timeoutRef.current)

  }, [appConfig.windowGeometry])

  const handleMainWindowChange = useEventHandler({
    Resize: () => {
      setAppConfig((prevState: appConfig) => ({
        ...prevState,
        windowGeometry: {
          ...prevState.windowGeometry,
          windowSize: {
            height: mainWindowRef!.current!.native.size().height(),
            width: mainWindowRef!.current!.native.size().width(),
          }
        }
      }))
    },
    Move: () => {
      setAppConfig((prevState: appConfig) => ({
        ...prevState,
        windowGeometry: {
          ...prevState.windowGeometry,
          windowPosition: {...mainWindowRef!.current!.native.pos()}
        }
      }))
    }
  }, [mainWindowRef])

  return (
    <Window
      ref={mainWindowRef}
      windowIcon={winIcon}
      windowTitle="RetroArch playlist manager"
      minSize={minSize}
      size={appConfig.windowGeometry.windowSize}
      pos={appConfig.windowGeometry.windowPosition}
      styleSheet={styleSheet}
      on={handleMainWindowChange}
    >
      <View>

        {/* <Text>changes count {mainWindowGeometryChangesCount.current}</Text> */}

        {(currentPlaylistInfo?.path !== '' && currentPlaylistInfo?.path !== undefined && Object.keys(currentPlaylistData).length !== 0)  ? 
        // {Object.keys(currentPlaylistData).length !== 0  ? 
        
        <PlaylistEditor 
          currentPlaylistInfo={currentPlaylistInfo} 
          currentPlaylistData={currentPlaylistData} 
          setCurrentPlaylistInfo={setCurrentPlaylistInfo}
          setCurrentPlaylistData={setCurrentPlaylistData}
          coresPath={coresPath}
          appConfig={appConfig}
        /> :
        
        showSettings ? 

        <Settings 
          appConfig={appConfig} 
          setAppConfig={setAppConfig}
          setShowSettings={setShowSettings}
        /> :
      
        <View id="main-menu-wrapper">
          <Text id="welcome-text">Welcome to RetroArch playlist manager</Text>
          <ChoseFolder chosenFolder={retroArchFolderPath} setChosenFolder={setRetroArchFolderPath} defaultText='Chose RetroArch folder' />
          {/* <ChoseFolder chosenFolder={ROMSFolderPath} setChosenFolder={setROMSFolderPath} defaultText='Chose ROMs folder'/> */}
          {playlistFolderPath !== '' && (
          <Playlists 
            setCurrentPlaylistInfo={setCurrentPlaylistInfo}
            createNewPlaylist={createNewPlaylist} 
            playlists={playlists} 
            setPlaylists={setPlaylists} 
          />)}
          <Button text="Settings" on={{ clicked: () => setShowSettings(true) }} />
        </View>
        }
      </View>
    </Window>
  );
}

export default hot(App);
