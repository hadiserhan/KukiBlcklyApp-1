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
 * @name Blockly.OutputFlyOut
 * @namespace
 **/
goog.provide('Blockly.OutputFlyOut');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Workspace');


Blockly.OutputFlyOut.flyoutCategory = function(workspace) {
    var xmlList = [];
    var blockText;
    var block;
    var canMeassage = true;

    var usedBlockList = [];

    var topBlocks = workspace.getTopBlocks();

    for (var i = 0; i < topBlocks.length; i++) {
      if(topBlocks[i].type=="new_event_obstacle"){
          //exclude object detection when IR messaging is used
          canMeassage = false;
      }
    }

    blockText = '<xml><block type="light_sound_LED">'+
          '<value name="CHOICE">'+
            '<shadow type="dropdown_light_sound_LED">'+
              '<field name="CHOICE">bothOn</field>'+
            '</shadow>'+
          '</value>'+
        '</block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
		blockText = '<xml><block type="light_sound_beep"></block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
		blockText = '<xml><block type="light_sound_play_whole">'+
          '<value name="CHOICE">'+
            '<shadow type="dropdown_light_sound_play_whole">'+
              '<field name="CHOICE">A</field>'+
            '</shadow>'+
          '</value>'+
        '</block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
		blockText = '<xml><block type="light_sound_play_half">'+
          '<value name="CHOICE">'+
            '<shadow type="dropdown_light_sound_play_half">'+
              '<field name="CHOICE">A</field>'+
            '</shadow>'+
          '</value>'+
        '</block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
		blockText = '<xml><block type="light_sound_play_quarter">'+
          '<value name="CHOICE">'+
            '<shadow type="dropdown_light_sound_play_quarter">'+
              '<field name="CHOICE">A</field>'+
            '</shadow>'+
          '</value>'+
        '</block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
		blockText = '<xml><block type="light_sound_play_eighth">'+
          '<value name="CHOICE">'+
            '<shadow type="dropdown_light_sound_play_eighth">'+
              '<field name="CHOICE">A</field>'+
            '</shadow>'+
          '</value>'+
        '</block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
		blockText = '<xml><block type="light_sound_rest">'+
          '<value name="CHOICE">'+
            '<shadow type="dropdown_light_sound_rest">'+
              '<field name="CHOICE">25</field>'+
            '</shadow>'+
          '</value>'+
        '</block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
		blockText = '<xml><block type="light_sound_note_sharp"></block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
		blockText = '<xml><block type="light_sound_note_tempo">'+
          '<value name="CHOICE">'+
            '<shadow type="dropdown_light_sound_note_tempo">'+
              '<field name="CHOICE">2</field>'+
            '</shadow>'+
          '</value>'+
        '</block></xml>';
		block = Blockly.Xml.textToDom(blockText).firstChild;
		xmlList.push(block);
    if(canMeassage){
      blockText = '<xml><block type="control_send_message" >'+
              '<value name="CHOICE">'+
                '<shadow type="dropdown_control_set_message">'+
                  '<field name="CHOICE">1</field>'+
                '</shadow>'+
              '</value>'+
          '</block></xml>';
      block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }






    return xmlList;

};
