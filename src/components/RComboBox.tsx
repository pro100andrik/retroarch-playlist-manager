import { QComboBoxSignals } from "@nodegui/nodegui";
import { ComboBox, Text, View, useEventHandler } from "@nodegui/react-nodegui";
import React, { memo, useMemo, useState } from "react";
import { ComboBoxItem } from "../TSTypes";

export function RComboBox(props: {label: string, initialIndex: number, currentIndexSetter: Function, items: ComboBoxItem[], keyInObject?: string, indexForHandler?: number, labelStyle?: string, style?: string}) {

  const getIndex = () => props.initialIndex
  const [neverChangingValue] = useState(null)
  const memoizedInitialIndex = useMemo(() => getIndex(), [neverChangingValue]);
  const getItems = () => props.items
  const memoizedItems = useMemo(() => getItems(), [neverChangingValue]);
  const memoizedComboBox = useMemo(() => <MemoComboBox items={memoizedItems} initialIndex={memoizedInitialIndex} currentIndexSetter={props.currentIndexSetter} keyInObject={props.keyInObject}  indexForHandler={props.indexForHandler} />, [neverChangingValue]);
  return (
    <View style={RComboBoxStyle + (props.style || '')}>
      <Text style={props.labelStyle || ''}>{props.label}</Text>
      {memoizedComboBox}
    </View>
  );
}

const MemoComboBox = memo(function MemoComboBox(props: {initialIndex: number, currentIndexSetter: Function, items: ComboBoxItem[], keyInObject?: string, indexForHandler?: number }){
  const handleChange = useEventHandler<QComboBoxSignals>({
    currentIndexChanged: (index) => {
      props.currentIndexSetter(props.keyInObject, index, props.indexForHandler)
      // console.log('selected index ', index)
    },
  }, [props.keyInObject])

  return (
    <View>
      <ComboBox 
        items={props.items}
        on={handleChange}
        currentIndex={props.initialIndex}
      />
    </View>
  )
})

const RComboBoxStyle = `
  flex-direction: row;
`

