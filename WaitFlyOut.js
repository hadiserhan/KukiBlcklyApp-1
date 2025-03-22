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
 * @name Blockly.WaitFlyOut
 * @namespace
 **/
goog.provide('Blockly.WaitFlyOut');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Workspace');


Blockly.WaitFlyOut.flyoutCategory = function(workspace) {
    var xmlList = [];
    var blockText;
    var block;
    var canMeassage = true;
    var canObsTrack = true;

    var usedBlockList = [];

    var topBlocks = workspace.getTopBlocks();

    for (var i = 0; i < topBlocks.length; i++) {
      if(topBlocks[i].type=="new_event_obstacle"){
          //exclude object detection when IR messaging is used
          canMeassage = false;
      }
      if(topBlocks[i].type.includes("new_event_message")||topBlocks[i].type.includes("new_event_remote")){
          //exclude object detection when IR messaging is used
          canObsTrack = false;
      }
    }

    blockText = '<xml><block type="control_wait_time">'+
          '<value name="DURATION">'+
            '<shadow type="math_positive_number">'+
              '<field name="NUM">1</field>'+
            '</shadow>'+
          '</value>'+
        '</block></xml>';
    block = Blockly.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);
		blockText = '<xml><block type="control_wait_event">'+
            '<value name="CHOICE">'+
              '<shadow type="dropdown_control_setwait_event">'+
                '<field name="CHOICE">clap</field>'+
              '</shadow>'+
            '</value>'+
        '</block></xml>';
    block = Blockly.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);
    if(canObsTrack){
      blockText = '<xml><block type="control_wait_event_obstacle"></block></xml>';
      block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }
		if(canMeassage){
      blockText = '<xml><block type="control_wait_message">'+
              '<value name="CHOICE">'+
                '<shadow type="dropdown_control_setwait_message">'+
                  '<field name="CHOICE">1</field>'+
                '</shadow>'+
              '</value>'+
          '</block></xml>';
      block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }







    return xmlList;

};
