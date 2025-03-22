/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview dynamic flyout creator for the events blocks.
 * @author ben@microbric.com <Ben Hayton>
 */


'use strict';

/**
 * @name Blockly.ControlFlyOut
 * @namespace
 **/
goog.provide('Blockly.ControlFlyOut');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Workspace');


Blockly.ControlFlyOut.flyoutCategory = function(workspace) {
    var xmlList = [];
    var blockText;
    var block;
    var canObsTrack = true;

    var usedBlockList = [];

    var topBlocks = workspace.getTopBlocks();

    for (var i = 0; i < topBlocks.length; i++) {
      if(topBlocks[i].type.includes("new_event_message")||topBlocks[i].type.includes("new_event_remote")){
          //exclude object detection when IR messaging is used
          canObsTrack = false;
      }
    }

    blockText = '<xml><block type="control_loop_forever"></block></xml>';
    block = Blockly.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);
    blockText = '<xml><block type="control_loop_number">'+
      '<value name="TIMES">'+
        '<shadow type="math_whole_number">'+
         '<field name="NUM">2</field>'+
        '</shadow>'+
      '</value>'+
    '</block></xml>';
    block = Blockly.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);
		blockText = '<xml><block type="control_loop_event">'+
            '<value name="CHOICE">'+
              '<shadow type="dropdown_control_setloop_event">'+
                '<field name="CHOICE">triangle</field>'+
              '</shadow>'+
            '</value>'+
        '</block></xml>';
    block = Blockly.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);
    if(canObsTrack){
      blockText = '<xml><block type="control_loop_event_obstacle"></block></xml>';
      block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }

		blockText = '<xml><block type="control_stop"></block></xml>';
    block = Blockly.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);

    return xmlList;

};
