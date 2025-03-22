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
 * @name Blockly.EventsFlyOut
 * @namespace
 **/
goog.provide('Blockly.EventsFlyOut');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Workspace');


Blockly.EventsFlyOut.flyoutCategory = function(workspace) {
    var xmlList = [];
    var blockText;
    var block;
    var disabled = "true";
    var eventNames = ["new_event_obstacle",
                      "new_event_clap_one",
                      "new_event_clap_two",
                      "new_event_key_triangle",
                      "new_event_key_circle",
                      "new_event_line_on_white",
                      "new_event_line_on_black",
                      "new_event_message_1",
                      "new_event_message_2",
                      "new_event_message_3",
                      "new_event_message_4",
                      "new_event_message_5",
                      "new_event_message_6",
                      "new_event_remote_code_1",
                      "new_event_remote_code_2",
                      "new_event_remote_code_3",
                      "new_event_remote_code_4",
                      "new_event_remote_code_5",
                      "new_event_remote_code_6",];

    var usedBlockList = [];

    var topBlocks = workspace.getAllBlocks();
    //var topBlocks = workspace.getTopBlocks();
    //console.log(workspace.getAllBlocks());

    for (var i = 0; i < topBlocks.length; i++) {
      if (!(usedBlockList.includes(topBlocks[i].type))) {
        usedBlockList.push(topBlocks[i].type);
      }
      if(topBlocks[i].type.includes("new_event_message")||topBlocks[i].type.includes("new_event_remote")||topBlocks[i].type=="control_wait_message"||topBlocks[i].type=="control_send_message"){
          //exclude object detection when IR messaging is used
          if (!(usedBlockList.includes("new_event_obstacle"))) {
            usedBlockList.push("new_event_obstacle");
          }
      }
      if(topBlocks[i].type=="new_event_obstacle"||topBlocks[i].type=="control_loop_event_obstacle"||topBlocks[i].type=="control_wait_event_obstacle"||topBlocks[i].type=="drive_line_tracking_obstacle"){
        //exclude IR when obstacle detection is used
        for(var irNum = 1; irNum <7; irNum++){
          usedBlockList.push("new_event_message_"+irNum.toString());
          usedBlockList.push("new_event_remote_code_"+irNum.toString());
        }
      }
    }

    for (var i = 0; i < eventNames.length; i++) {
      var blockType=eventNames[i];
      if (!(usedBlockList.includes(blockType))) {
        var block = goog.dom.createDom('block');
        block.setAttribute('type', blockType);
        xmlList.push(block);
      }
    }




    return xmlList;

};
