import { View, Text } from "@nodegui/react-nodegui";
import React, { ReactElement } from "react";

export function LineEditLabeled(props: {label: string, children: ReactElement, labelStyle?: string, style?: string}) {

  return (
    <View style={lineEditLabeledStyle + (props.style || '')}>
      <Text style={props.labelStyle || ''}>{props.label}</Text>
      {props.children}
    </View>
  )
}

const lineEditLabeledStyle = `
  flex-direction: row;
`