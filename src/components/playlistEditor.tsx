import { View, Text, LineEdit, Button, ScrollArea } from "@nodegui/react-nodegui";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { coresSortTypes, coresFilterTypes, getCoreIndex, getCoresListWithInstalled, getROMsObjectsFromPaths, getSortedCores, writePlaylistToDrive, getFilteredCores } from "../utils";
import path from "path";
import { LABEL_DISPLAY_MODES, SORT_MODES, THUMBNAIL_MODES, CORES, DATABASES } from "../retroArchVariables";
import { RComboBox } from "./RComboBox";
import { LineEditLabeled } from "./lineEditLabeled";
import { ChoseROMs } from "./choseROMs";
import fs from 'fs'
const _ = require('lodash');
import { PlaylistsType, PlaylistData, ROMData, appConfig, ComboBoxItem } from "../TSTypes";

const CORES_ARRAY = Object.entries(CORES) 

export function PlaylistEditor(props: {
  coresPath: string;
  currentPlaylistInfo: PlaylistsType,
  currentPlaylistData: PlaylistData,
  setCurrentPlaylistInfo: Function,
  setCurrentPlaylistData: Function,
  appConfig: appConfig,
}) {
  const playlistItemGeometry = {
    height: props.appConfig.advancedRomFields ? 140 : 70,
    marginBottom: 3,
  }

  const coresSortType = props.appConfig.coresSortType;
  const coresFilterType = props.appConfig.hideNonInstalledCores ? coresFilterTypes.installed : coresFilterTypes.all;

  const filteredCores = useMemo<any[][]>(() => getFilteredCores(getCoresListWithInstalled(props.coresPath, CORES_ARRAY), coresFilterType), [])
  const sortedCoresArray = useMemo<any[][]>(() => getSortedCores(filteredCores, coresSortType), [])

  // TODO: add local items state and make search ability
  // TODO: add order changing for roms (drag & dorp)
  // FIXME: mouse scroll wheel shod'nt change values while hovers above combobox

  const buttonHandler = (type: string, value?: object) => { 
    if (type === 'cancelChanges'){
      props.setCurrentPlaylistInfo(() => ({}))
    }

    if (type === 'saveChanges' && typeof value === 'object'){
      console.log(props.currentPlaylistData)
      writePlaylistToDrive(props.currentPlaylistInfo.path, value)
      // props.setCurrentPlaylistInfo(() => ({}))
    }
  }

  const [openedROMs, setOpenedROMs] = useState([])

  useEffect(() => {
    if (openedROMs.length > 0){
      addROMsHandler(openedROMs)
    }
  }, [openedROMs])
  const addROMsHandler = (ROMsPaths: string[]) => {
    const newRoms = getROMsObjectsFromPaths(ROMsPaths)
    const newRomsUnique = newRoms.filter(rom => !props.currentPlaylistData.items.map((stateRom: ROMData) => path.normalize(stateRom["path"])).includes(path.normalize(rom["path"])))
    props.setCurrentPlaylistData((prevState: PlaylistData) => ({
      ...prevState, 
      items: [...prevState.items, ...newRomsUnique]
    }))
    setOpenedROMs([])
  }

  const handleInfoChange = useCallback((key: string, value: string | number, targetIndex?: number) => {

    if (key === 'delete'){
      props.setCurrentPlaylistData((prevState: PlaylistData) => ({
         ...prevState, 
         items: prevState.items.filter((_, index) => index !== targetIndex)
      }))
      return
    }
    if (targetIndex !== undefined && typeof key === 'string'){
      props.setCurrentPlaylistData((prevState: PlaylistData) => {
        const newItems = prevState.items.map((item: ROMData, index: number) => { //FIXME: FIX any
          if (index === targetIndex){
            item[key] = value;
            if (key === 'core_name' && typeof value === 'number'){
              const corePath = path.join(props.coresPath, sortedCoresArray[value][0] + '.dll')
              item[key] = sortedCoresArray[value][1]
              item.core_path = fs.existsSync(corePath) ? corePath : 'DETECT';
            } 
            if (key === 'db_name' && typeof value === 'number'){
              item[key] = DATABASES[index][0]
            } 
          }
          return item
        })
        return ({ ...prevState, items: newItems})
      })
      return
    }

    if (targetIndex === undefined && typeof key === 'string'){
      props.setCurrentPlaylistData((prevState: PlaylistData) => {
        if (key === 'default_core_name' && typeof value === 'number'){
          return {
            ...prevState,
            items: [...prevState.items],
            default_core_name: sortedCoresArray[value][1],
            default_core_path: sortedCoresArray[value][1] === fs.existsSync(path.join(props.coresPath, sortedCoresArray[value][0] + '.dll')) ? path.join(props.coresPath, sortedCoresArray[value][0] + '.dll') : 'DETECT'
          }
        }
        return {
          ...prevState,
          items: [...prevState.items],
          [key]: value
        }
      })
      return
    }
    return
  },[])


  return (
    <View id="playlist-editor-wrapper" >
      <View id="playlist-editor-playlist-values">
        <Text id="playlist-editor-playlist-name">{props.currentPlaylistInfo.name}</Text>
        <LineEditLabeled 
          style={playlistValuesPaddingStyle}
          labelStyle={playlistValuesLabelStyle}
          label="Version" 
          children={<LineEdit 
            style="width: 30px;"
            text={props.currentPlaylistData.version} 
            placeholderText='Version'
            on={{ textChanged: (textValue) => handleInfoChange('version', textValue) }}
          />} 
        />

        {/* TODO: show to user if core not installed */}
        

        {props.appConfig.advancedRomFields && (
          <LineEditLabeled 
            style={playlistValuesPaddingStyle}
            labelStyle={playlistValuesLabelStyle}
            label="Default Core Path:" 
            children={<LineEdit 
              text={props.currentPlaylistData.default_core_path} 
              placeholderText='Default Core Path'
              on={{ textChanged: (textValue) => handleInfoChange('default_core_path', textValue) }}
            />} 
          />
        )}
        <RComboBox 
          style={playlistValuesPaddingStyle}
          labelStyle={playlistValuesLabelStyle}
          currentIndexSetter={handleInfoChange}
          initialIndex={getCoreIndex(props.currentPlaylistData.default_core_path, sortedCoresArray)}
          items={sortedCoresArray.map(core => ({text: core[1]}))}
          label="Default Core name:"
          keyInObject="default_core_name"
        />
        <RComboBox 
          style={playlistValuesPaddingStyle}
          labelStyle={playlistValuesLabelStyle}
          items={Object.keys(LABEL_DISPLAY_MODES).map((key: string) => ({text: LABEL_DISPLAY_MODES[key] }))}
          label="Label Display Mode"
          initialIndex={Number(props.currentPlaylistData.label_display_mode)}
          currentIndexSetter={handleInfoChange}
          keyInObject="label_display_mode"
        />

        <RComboBox 
          style={playlistValuesPaddingStyle}
          labelStyle={playlistValuesLabelStyle}
          items={Object.keys(THUMBNAIL_MODES).map((key: string) => ({text: THUMBNAIL_MODES[key] }))}
          label="Primary Thumbnail"
          initialIndex={Number(props.currentPlaylistData.right_thumbnail_mode)}
          currentIndexSetter={handleInfoChange}
          keyInObject="right_thumbnail_mode"
        />

        <RComboBox 
          style={playlistValuesPaddingStyle}
          labelStyle={playlistValuesLabelStyle}
          items={Object.keys(THUMBNAIL_MODES).map((key: string) => ({text: THUMBNAIL_MODES[key] }))}
          label="Secondary Thumbnail"
          initialIndex={Number(props.currentPlaylistData.left_thumbnail_mode)}
          currentIndexSetter={handleInfoChange}
          keyInObject="left_thumbnail_mode"
        />
        
        <RComboBox 
          style={playlistValuesPaddingStyle}
          labelStyle={playlistValuesLabelStyle}
          items={Object.keys(SORT_MODES).map((key: string) => ({text: SORT_MODES[key] }))}
          label="Sort Mode"
          initialIndex={Number(props.currentPlaylistData.sort_mode)}
          currentIndexSetter={handleInfoChange}
          keyInObject="sort_mode"
        />
      </View>
      <Text id="playlist-editor-roms-tittle">ROMS: {props.currentPlaylistData.items.length}</Text>
      <ScrollArea enabled id="playlist-editor-playlist-items-scroll">
      <View 
        style={`min-height: ${props.currentPlaylistData.items.length * (playlistItemGeometry.height + playlistItemGeometry.marginBottom)}`}
        id="playlist-editor-playlist-items"
      >
      {props.currentPlaylistData.items.map((item: ROMData, index: number) => (   //TODO: add ROMs sorting
        <View 
          style={`height: ${playlistItemGeometry.height}; margin-bottom: ${playlistItemGeometry.marginBottom}`}
          id="playlist-editor-playlist-item"
          key={index}
        >
          <View style="flex-direction: row">
            <LineEditLabeled 
              style={playlistItemsValuesPaddingStyle}
              labelStyle={playlistItemsValuesLabelStyle}
              label="Label:" 
              children={<LineEdit 
                style={playlistItemsLineEditROMLabelStyle}
                text={item.label} 
                placeholderText='ROM name in RetroArch'
                on={{ textChanged: (textValue) => handleInfoChange('label', textValue, index) }}
              />} 
            />
            <Button
              text='Delete'
              on={{ clicked: () => handleInfoChange('delete', '', index) }}
            />
          </View>
          <LineEditLabeled 
            style={playlistItemsValuesPaddingStyle}
            labelStyle={playlistItemsValuesLabelStyle}
            label="ROM Path:" 
            children={<LineEdit 
              style={playlistItemsLineEditStyle}
              text={item.path} 
              placeholderText='ROM path'
              on={{ textChanged: (textValue) => handleInfoChange('path', textValue, index) }}
            />} 
          />
          {props.appConfig.advancedRomFields && (
            <LineEditLabeled 
              style={playlistItemsValuesPaddingStyle}
              labelStyle={playlistItemsValuesLabelStyle}
              label="Core Path:" 
              children={<LineEdit 
                style={playlistItemsLineEditStyle}
                text={item.core_path} 
                placeholderText='Core Path'
                on={{ textChanged: (textValue) => handleInfoChange('core_path', textValue, index) }}
              />} 
            />
          )}
          <RComboBox
            style={playlistItemsValuesPaddingStyle}
            labelStyle={playlistItemsValuesLabelStyle} 
            currentIndexSetter={handleInfoChange}
            initialIndex={getCoreIndex(item.core_path, sortedCoresArray)}
            items={sortedCoresArray.map(core => ({text: core[1]}))}
            label="Core name:"
            keyInObject="core_name"
            indexForHandler={index}
          />
          {props.appConfig.advancedRomFields && (
            <LineEditLabeled 
              style={playlistItemsValuesPaddingStyle}
              labelStyle={playlistItemsValuesLabelStyle}
              label="CRC32:" 
              children={<LineEdit   
                text={item.crc32} 
                placeholderText='DB name'
                on={{ textChanged: (textValue) => handleInfoChange('crc32', textValue, index) }}
              />} 
            />
          )}

          {props.appConfig.advancedRomFields && (
            <RComboBox 
              style={playlistItemsValuesPaddingStyle}
              labelStyle={playlistItemsValuesLabelStyle}
              currentIndexSetter={handleInfoChange}
              initialIndex={DATABASES.findIndex(db => db[0] === item.db_name)}
              items={DATABASES.map(db => ({text: db[0]}))}
              label="DB name:"
              keyInObject="db_name"
              indexForHandler={index}
            />
          )}
        </View>
      ))}
      </View>
      </ScrollArea>

      <ChoseROMs 
        setChosenFiles={setOpenedROMs}
      />

      <Button
        text='Cancel'
        on={{ clicked: () => buttonHandler("cancelChanges") }}
      />
      <Button
        text='Save'
        on={{ clicked: () => buttonHandler("saveChanges", props.currentPlaylistData) }}
      />
    </View>
  );
}

const playlistValuesLabelStyle = `
  width: '110px';
  margin: 0px;
`
const playlistItemsValuesLabelStyle = `
width: '60px';
`

const playlistItemsLineEditStyle = `
width: '400px';
`

const playlistItemsLineEditROMLabelStyle = `
width: '325px';
`

const playlistValuesPaddingStyle = `
padding-bottom: '3px';
`

const playlistItemsValuesPaddingStyle = `
padding-bottom: '2px';
`