/**
 * @license
 * Visual Blocks Language
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
 * @fileoverview English strings.
 * @author ascii@media.mit.edu (Andrew Sliwinski)
 *
 * After modifying this file, run `npm run translate` from the root directory
 * to regenerate `./msg/json/en.json`.
 * IMPORTANT:
 * All message strings must use single quotes for the scripts to work properly
 */
'use strict';

goog.provide('Blockly.Msg.en');

goog.require('Blockly.Msg');

// Control blocks
Blockly.Msg.CONTROL_FOREVER = 'forever';
Blockly.Msg.CONTROL_REPEAT = 'repeat %1';
Blockly.Msg.CONTROL_IF = 'if %1 then';
Blockly.Msg.CONTROL_ELSE = 'else';
Blockly.Msg.CONTROL_STOP = 'stop';
Blockly.Msg.CONTROL_STOP_ALL = 'all';
Blockly.Msg.CONTROL_STOP_THIS = 'this script';
Blockly.Msg.CONTROL_STOP_OTHER = 'other scripts in sprite';
Blockly.Msg.CONTROL_WAIT = 'wait %1 seconds';
Blockly.Msg.CONTROL_WAITUNTIL = 'wait until %1';
Blockly.Msg.CONTROL_REPEATUNTIL = 'repeat until %1';
Blockly.Msg.CONTROL_WHILE = 'while %1';
Blockly.Msg.CONTROL_FOREACH = 'for each %1 in %2';
Blockly.Msg.CONTROL_STARTASCLONE = 'when I start as a clone';
Blockly.Msg.CONTROL_CREATECLONEOF = 'create clone of %1';
Blockly.Msg.CONTROL_CREATECLONEOF_MYSELF = 'myself';
Blockly.Msg.CONTROL_DELETETHISCLONE = 'delete this clone';
Blockly.Msg.CONTROL_COUNTER = 'counter';
Blockly.Msg.CONTROL_INCRCOUNTER = 'increment counter';
Blockly.Msg.CONTROL_CLEARCOUNTER = 'clear counter';
Blockly.Msg.CONTROL_ALLATONCE = 'all at once';

// Data blocks
Blockly.Msg.DATA_SETVARIABLETO = 'set %1 to %2';
Blockly.Msg.DATA_CHANGEVARIABLEBY = 'change %1 by %2';
Blockly.Msg.DATA_SHOWVARIABLE = 'show variable %1';
Blockly.Msg.DATA_HIDEVARIABLE = 'hide variable %1';
Blockly.Msg.DATA_ADDTOLIST = 'add %1 to %2';
Blockly.Msg.DATA_DELETEOFLIST = 'delete %1 of %2';
Blockly.Msg.DATA_DELETEALLOFLIST = 'delete all of %1';
Blockly.Msg.DATA_INSERTATLIST = 'insert %1 at %2 of %3';
Blockly.Msg.DATA_REPLACEITEMOFLIST = 'replace item %1 of %2 with %3';
Blockly.Msg.DATA_ITEMOFLIST = 'item %1 of %2';
Blockly.Msg.DATA_ITEMNUMOFLIST = 'item # of %1 in %2';
Blockly.Msg.DATA_LENGTHOFLIST = 'length of %1';
Blockly.Msg.DATA_LISTCONTAINSITEM = '%1 contains %2?';
Blockly.Msg.DATA_SHOWLIST = 'show list %1';
Blockly.Msg.DATA_HIDELIST = 'hide list %1';
Blockly.Msg.DATA_INDEX_ALL = 'all';
Blockly.Msg.DATA_INDEX_LAST = 'last';
Blockly.Msg.DATA_INDEX_RANDOM = 'random';

// Event blocks
Blockly.Msg.EVENT_WHENFLAGCLICKED = 'when %1 clicked';
Blockly.Msg.EVENT_WHENTHISSPRITECLICKED = 'when this sprite clicked';
Blockly.Msg.EVENT_WHENSTAGECLICKED = 'when stage clicked';
Blockly.Msg.EVENT_WHENTOUCHINGOBJECT = 'when this sprite touches %1';
Blockly.Msg.EVENT_WHENBROADCASTRECEIVED = 'when I receive %1';
Blockly.Msg.EVENT_WHENBACKDROPSWITCHESTO = 'when backdrop switches to %1';
Blockly.Msg.EVENT_WHENGREATERTHAN = 'when %1 > %2';
Blockly.Msg.EVENT_WHENGREATERTHAN_TIMER = 'timer';
Blockly.Msg.EVENT_WHENGREATERTHAN_LOUDNESS = 'loudness';
Blockly.Msg.EVENT_BROADCAST = 'broadcast %1';
Blockly.Msg.EVENT_BROADCASTANDWAIT = 'broadcast %1 and wait';
Blockly.Msg.EVENT_WHENKEYPRESSED = 'when %1 key pressed';
Blockly.Msg.EVENT_WHENKEYPRESSED_SPACE = 'space';
Blockly.Msg.EVENT_WHENKEYPRESSED_LEFT = 'left arrow';
Blockly.Msg.EVENT_WHENKEYPRESSED_RIGHT = 'right arrow';
Blockly.Msg.EVENT_WHENKEYPRESSED_DOWN = 'down arrow';
Blockly.Msg.EVENT_WHENKEYPRESSED_UP = 'up arrow';
Blockly.Msg.EVENT_WHENKEYPRESSED_ANY = 'any';

// Looks blocks
Blockly.Msg.LOOKS_SAYFORSECS = 'say %1 for %2 seconds';
Blockly.Msg.LOOKS_SAY = 'say %1';
Blockly.Msg.LOOKS_HELLO = 'Hello!';
Blockly.Msg.LOOKS_THINKFORSECS = 'think %1 for %2 seconds';
Blockly.Msg.LOOKS_THINK = 'think %1';
Blockly.Msg.LOOKS_HMM = 'Hmm...';
Blockly.Msg.LOOKS_SHOW = 'show';
Blockly.Msg.LOOKS_HIDE = 'hide';
Blockly.Msg.LOOKS_HIDEALLSPRITES = 'hide all sprites';
Blockly.Msg.LOOKS_EFFECT_COLOR = 'color';
Blockly.Msg.LOOKS_EFFECT_FISHEYE = 'fisheye';
Blockly.Msg.LOOKS_EFFECT_WHIRL = 'whirl';
Blockly.Msg.LOOKS_EFFECT_PIXELATE = 'pixelate';
Blockly.Msg.LOOKS_EFFECT_MOSAIC = 'mosaic';
Blockly.Msg.LOOKS_EFFECT_BRIGHTNESS = 'brightness';
Blockly.Msg.LOOKS_EFFECT_GHOST = 'ghost';
Blockly.Msg.LOOKS_CHANGEEFFECTBY = 'change %1 effect by %2';
Blockly.Msg.LOOKS_SETEFFECTTO = 'set %1 effect to %2';
Blockly.Msg.LOOKS_CLEARGRAPHICEFFECTS = 'clear graphic effects';
Blockly.Msg.LOOKS_CHANGESIZEBY = 'change size by %1';
Blockly.Msg.LOOKS_SETSIZETO = 'set size to %1 %';
Blockly.Msg.LOOKS_SIZE = 'size';
Blockly.Msg.LOOKS_CHANGESTRETCHBY = 'change stretch by %1';
Blockly.Msg.LOOKS_SETSTRETCHTO = 'set stretch to %1 %';
Blockly.Msg.LOOKS_SWITCHCOSTUMETO = 'switch costume to %1';
Blockly.Msg.LOOKS_NEXTCOSTUME = 'next costume';
Blockly.Msg.LOOKS_SWITCHBACKDROPTO = 'switch backdrop to %1';
Blockly.Msg.LOOKS_GOTOFRONTBACK = 'go to %1 layer';
Blockly.Msg.LOOKS_GOTOFRONTBACK_FRONT = 'front';
Blockly.Msg.LOOKS_GOTOFRONTBACK_BACK = 'back';
Blockly.Msg.LOOKS_GOFORWARDBACKWARDLAYERS = 'go %1 %2 layers';
Blockly.Msg.LOOKS_GOFORWARDBACKWARDLAYERS_FORWARD = 'forward';
Blockly.Msg.LOOKS_GOFORWARDBACKWARDLAYERS_BACKWARD = 'backward';
Blockly.Msg.LOOKS_BACKDROPNUMBERNAME = 'backdrop %1';
Blockly.Msg.LOOKS_COSTUMENUMBERNAME = 'costume %1';
Blockly.Msg.LOOKS_NUMBERNAME_NUMBER = 'number';
Blockly.Msg.LOOKS_NUMBERNAME_NAME = 'name';
Blockly.Msg.LOOKS_SWITCHBACKDROPTOANDWAIT = 'switch backdrop to %1 and wait';
Blockly.Msg.LOOKS_NEXTBACKDROP_BLOCK = 'next backdrop';
Blockly.Msg.LOOKS_NEXTBACKDROP = 'next backdrop';
Blockly.Msg.LOOKS_PREVIOUSBACKDROP = 'previous backdrop';
Blockly.Msg.LOOKS_RANDOMBACKDROP = 'random backdrop';

// Motion blocks
Blockly.Msg.MOTION_MOVESTEPS = 'move %1 steps';
Blockly.Msg.MOTION_TURNLEFT = 'turn %1 %2 degrees';
Blockly.Msg.MOTION_TURNRIGHT = 'turn %1 %2 degrees';
Blockly.Msg.MOTION_POINTINDIRECTION = 'point in direction %1';
Blockly.Msg.MOTION_POINTTOWARDS = 'point towards %1';
Blockly.Msg.MOTION_POINTTOWARDS_POINTER = 'mouse-pointer';
Blockly.Msg.MOTION_POINTTOWARDS_RANDOM = 'random direction';
Blockly.Msg.MOTION_GOTO = 'go to %1';
Blockly.Msg.MOTION_GOTO_POINTER = 'mouse-pointer';
Blockly.Msg.MOTION_GOTO_RANDOM = 'random position';
Blockly.Msg.MOTION_GOTOXY = 'go to x: %1 y: %2';
Blockly.Msg.MOTION_GLIDESECSTOXY = 'glide %1 secs to x: %2 y: %3';
Blockly.Msg.MOTION_GLIDETO = 'glide %1 secs to %2';
Blockly.Msg.MOTION_GLIDETO_POINTER = 'mouse-pointer';
Blockly.Msg.MOTION_GLIDETO_RANDOM = 'random position';
Blockly.Msg.MOTION_CHANGEXBY = 'change x by %1';
Blockly.Msg.MOTION_SETX = 'set x to %1';
Blockly.Msg.MOTION_CHANGEYBY = 'change y by %1';
Blockly.Msg.MOTION_SETY = 'set y to %1';
Blockly.Msg.MOTION_IFONEDGEBOUNCE = 'if on edge, bounce';
Blockly.Msg.MOTION_SETROTATIONSTYLE = 'set rotation style %1';
Blockly.Msg.MOTION_SETROTATIONSTYLE_LEFTRIGHT = 'left-right';
Blockly.Msg.MOTION_SETROTATIONSTYLE_DONTROTATE = 'don\'t rotate';
Blockly.Msg.MOTION_SETROTATIONSTYLE_ALLAROUND = 'all around';
Blockly.Msg.MOTION_XPOSITION = 'x position';
Blockly.Msg.MOTION_YPOSITION = 'y position';
Blockly.Msg.MOTION_DIRECTION = 'direction';
Blockly.Msg.MOTION_SCROLLRIGHT = 'scroll right %1';
Blockly.Msg.MOTION_SCROLLUP = 'scroll up %1';
Blockly.Msg.MOTION_ALIGNSCENE = 'align scene %1';
Blockly.Msg.MOTION_ALIGNSCENE_BOTTOMLEFT = 'bottom-left';
Blockly.Msg.MOTION_ALIGNSCENE_BOTTOMRIGHT = 'bottom-right';
Blockly.Msg.MOTION_ALIGNSCENE_MIDDLE = 'middle';
Blockly.Msg.MOTION_ALIGNSCENE_TOPLEFT = 'top-left';
Blockly.Msg.MOTION_ALIGNSCENE_TOPRIGHT = 'top-right';
Blockly.Msg.MOTION_XSCROLL = 'x scroll';
Blockly.Msg.MOTION_YSCROLL = 'y scroll';
Blockly.Msg.MOTION_STAGE_SELECTED = 'Stage selected: no motion blocks';

// Operators blocks
Blockly.Msg.OPERATORS_ADD = '%1 + %2';
Blockly.Msg.OPERATORS_SUBTRACT = '%1 - %2';
Blockly.Msg.OPERATORS_MULTIPLY = '%1 * %2';
Blockly.Msg.OPERATORS_DIVIDE = '%1 / %2';
Blockly.Msg.OPERATORS_RANDOM = 'pick random %1 to %2';
Blockly.Msg.OPERATORS_GT = '%1 > %2';
Blockly.Msg.OPERATORS_LT = '%1 < %2';
Blockly.Msg.OPERATORS_EQUALS = '%1 = %2';
Blockly.Msg.OPERATORS_AND = '%1 and %2';
Blockly.Msg.OPERATORS_OR = '%1 or %2';
Blockly.Msg.OPERATORS_NOT = 'not %1';
Blockly.Msg.OPERATORS_JOIN = 'join %1 %2';
Blockly.Msg.OPERATORS_JOIN_APPLE = 'apple';
Blockly.Msg.OPERATORS_JOIN_BANANA = 'banana';
Blockly.Msg.OPERATORS_LETTEROF = 'letter %1 of %2';
Blockly.Msg.OPERATORS_LETTEROF_APPLE = 'a';
Blockly.Msg.OPERATORS_LENGTH = 'length of %1';
Blockly.Msg.OPERATORS_CONTAINS = '%1 contains %2?';
Blockly.Msg.OPERATORS_MOD = '%1 mod %2';
Blockly.Msg.OPERATORS_ROUND = 'round %1';
Blockly.Msg.OPERATORS_MATHOP = '%1 of %2';
Blockly.Msg.OPERATORS_MATHOP_ABS = 'abs';
Blockly.Msg.OPERATORS_MATHOP_FLOOR = 'floor';
Blockly.Msg.OPERATORS_MATHOP_CEILING = 'ceiling';
Blockly.Msg.OPERATORS_MATHOP_SQRT = 'sqrt';
Blockly.Msg.OPERATORS_MATHOP_SIN = 'sin';
Blockly.Msg.OPERATORS_MATHOP_COS = 'cos';
Blockly.Msg.OPERATORS_MATHOP_TAN = 'tan';
Blockly.Msg.OPERATORS_MATHOP_ASIN = 'asin';
Blockly.Msg.OPERATORS_MATHOP_ACOS = 'acos';
Blockly.Msg.OPERATORS_MATHOP_ATAN = 'atan';
Blockly.Msg.OPERATORS_MATHOP_LN = 'ln';
Blockly.Msg.OPERATORS_MATHOP_LOG = 'log';
Blockly.Msg.OPERATORS_MATHOP_EEXP = 'e ^';
Blockly.Msg.OPERATORS_MATHOP_10EXP = '10 ^';

// Procedures blocks
Blockly.Msg.PROCEDURES_DEFINITION = 'define %1';

// Sensing blocks
Blockly.Msg.SENSING_TOUCHINGOBJECT = 'touching %1?';
Blockly.Msg.SENSING_TOUCHINGOBJECT_POINTER = 'mouse-pointer';
Blockly.Msg.SENSING_TOUCHINGOBJECT_EDGE = 'edge';
Blockly.Msg.SENSING_TOUCHINGCOLOR = 'touching color %1?';
Blockly.Msg.SENSING_COLORISTOUCHINGCOLOR = 'color %1 is touching %2?';
Blockly.Msg.SENSING_DISTANCETO = 'distance to %1';
Blockly.Msg.SENSING_DISTANCETO_POINTER = 'mouse-pointer';
Blockly.Msg.SENSING_ASKANDWAIT = 'ask %1 and wait';
Blockly.Msg.SENSING_ASK_TEXT = 'What\'s your name?';
Blockly.Msg.SENSING_ANSWER = 'answer';
Blockly.Msg.SENSING_KEYPRESSED = 'key %1 pressed?';
Blockly.Msg.SENSING_MOUSEDOWN = 'mouse down?';
Blockly.Msg.SENSING_MOUSEX = 'mouse x';
Blockly.Msg.SENSING_MOUSEY = 'mouse y';
Blockly.Msg.SENSING_SETDRAGMODE = 'set drag mode %1';
Blockly.Msg.SENSING_SETDRAGMODE_DRAGGABLE = 'draggable';
Blockly.Msg.SENSING_SETDRAGMODE_NOTDRAGGABLE = 'not draggable';
Blockly.Msg.SENSING_LOUDNESS = 'loudness';
Blockly.Msg.SENSING_LOUD = 'loud?';
Blockly.Msg.SENSING_TIMER = 'timer';
Blockly.Msg.SENSING_RESETTIMER = 'reset timer';
Blockly.Msg.SENSING_OF = '%1 of %2';
Blockly.Msg.SENSING_OF_XPOSITION = 'x position';
Blockly.Msg.SENSING_OF_YPOSITION = 'y position';
Blockly.Msg.SENSING_OF_DIRECTION = 'direction';
Blockly.Msg.SENSING_OF_COSTUMENUMBER = 'costume #';
Blockly.Msg.SENSING_OF_COSTUMENAME = 'costume name';
Blockly.Msg.SENSING_OF_SIZE = 'size';
Blockly.Msg.SENSING_OF_VOLUME = 'volume';
Blockly.Msg.SENSING_OF_BACKDROPNUMBER = 'backdrop #';
Blockly.Msg.SENSING_OF_BACKDROPNAME = 'backdrop name';
Blockly.Msg.SENSING_OF_STAGE = 'Stage';
Blockly.Msg.SENSING_CURRENT = 'current %1';
Blockly.Msg.SENSING_CURRENT_YEAR = 'year';
Blockly.Msg.SENSING_CURRENT_MONTH = 'month';
Blockly.Msg.SENSING_CURRENT_DATE = 'date';
Blockly.Msg.SENSING_CURRENT_DAYOFWEEK = 'day of week';
Blockly.Msg.SENSING_CURRENT_HOUR = 'hour';
Blockly.Msg.SENSING_CURRENT_MINUTE = 'minute';
Blockly.Msg.SENSING_CURRENT_SECOND = 'second';
Blockly.Msg.SENSING_DAYSSINCE2000 = 'days since 2000';
Blockly.Msg.SENSING_USERNAME = 'username';
Blockly.Msg.SENSING_USERID = 'user id';

// Sound blocks
Blockly.Msg.SOUND_PLAY = 'start sound %1';
Blockly.Msg.SOUND_PLAYUNTILDONE = 'play sound %1 until done';
Blockly.Msg.SOUND_STOPALLSOUNDS = 'stop all sounds';
Blockly.Msg.SOUND_SETEFFECTO = 'set %1 effect to %2';
Blockly.Msg.SOUND_CHANGEEFFECTBY = 'change %1 effect by %2';
Blockly.Msg.SOUND_CLEAREFFECTS = 'clear sound effects';
Blockly.Msg.SOUND_EFFECTS_PITCH = 'pitch';
Blockly.Msg.SOUND_EFFECTS_PAN = 'pan left/right';
Blockly.Msg.SOUND_CHANGEVOLUMEBY = 'change volume by %1';
Blockly.Msg.SOUND_SETVOLUMETO = 'set volume to %1%';
Blockly.Msg.SOUND_VOLUME = 'volume';
Blockly.Msg.SOUND_RECORD = 'record...';

// Category labels
Blockly.Msg.CATEGORY_MOTION = 'Motion';
Blockly.Msg.CATEGORY_LOOKS = 'Looks';
Blockly.Msg.CATEGORY_SOUND = 'Sound';
Blockly.Msg.CATEGORY_EVENTS = 'Events';
Blockly.Msg.CATEGORY_CONTROL = 'Control';
Blockly.Msg.CATEGORY_SENSING = 'Sensing';
Blockly.Msg.CATEGORY_OPERATORS = 'Operators';
Blockly.Msg.CATEGORY_VARIABLES = 'Variables';
Blockly.Msg.CATEGORY_MYBLOCKS = 'My Blocks';

// Context menus
Blockly.Msg.DUPLICATE = 'Duplicate';
Blockly.Msg.DELETE = 'Delete';
Blockly.Msg.ADD_COMMENT = 'Add Comment';
Blockly.Msg.REMOVE_COMMENT = 'Remove Comment';
Blockly.Msg.DELETE_BLOCK = 'Delete Block';
Blockly.Msg.DELETE_X_BLOCKS = 'Delete %1 Blocks';
Blockly.Msg.DELETE_ALL_BLOCKS = 'Delete all %1 blocks?';
Blockly.Msg.CLEAN_UP = 'Clean up Blocks';
Blockly.Msg.HELP = 'Help';
Blockly.Msg.UNDO = 'Undo';
Blockly.Msg.REDO = 'Redo';
Blockly.Msg.EDIT_PROCEDURE = 'Edit';
Blockly.Msg.SHOW_PROCEDURE_DEFINITION = 'Go to definition';
Blockly.Msg.WORKSPACE_COMMENT_DEFAULT_TEXT = 'Say something...';

// Color
Blockly.Msg.COLOUR_HUE_LABEL = 'Color';
Blockly.Msg.COLOUR_SATURATION_LABEL = 'Saturation';
Blockly.Msg.COLOUR_BRIGHTNESS_LABEL = 'Brightness';

// Variables
// @todo Remove these once fully managed by Scratch VM / Scratch GUI
Blockly.Msg.CHANGE_VALUE_TITLE = 'Change value:';
Blockly.Msg.RENAME_VARIABLE = 'Rename variable';
Blockly.Msg.RENAME_VARIABLE_TITLE = 'Rename all "%1" variables to:';
Blockly.Msg.RENAME_VARIABLE_MODAL_TITLE = 'Rename Variable';
Blockly.Msg.NEW_VARIABLE = 'Make a Variable';
Blockly.Msg.NEW_VARIABLE_TITLE = 'New variable name:';
Blockly.Msg.VARIABLE_MODAL_TITLE = 'New Variable';
Blockly.Msg.VARIABLE_ALREADY_EXISTS = 'A variable named "%1" already exists.';
Blockly.Msg.VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE = 'A variable named "%1" already exists for another variable of type "%2".';
Blockly.Msg.DELETE_VARIABLE_CONFIRMATION = 'Delete %1 uses of the "%2" variable?';
Blockly.Msg.CANNOT_DELETE_VARIABLE_PROCEDURE = 'Can\'t delete the variable "%1" because it\'s part of the definition of the function "%2"';
Blockly.Msg.DELETE_VARIABLE = 'Delete the "%1" variable';

// Custom Procedures
// @todo Remove these once fully managed by Scratch VM / Scratch GUI
Blockly.Msg.NEW_PROCEDURE = 'Make a Block';
Blockly.Msg.PROCEDURE_ALREADY_EXISTS = 'A procedure named "%1" already exists.';
Blockly.Msg.PROCEDURE_DEFAULT_NAME = 'block name';
Blockly.Msg.PROCEDURE_USED = 'To delete a block definition, first remove all uses of the block';

// Lists
// @todo Remove these once fully managed by Scratch VM / Scratch GUI
Blockly.Msg.NEW_LIST = 'Make a List';
Blockly.Msg.NEW_LIST_TITLE = 'New list name:';
Blockly.Msg.LIST_MODAL_TITLE = 'New List';
Blockly.Msg.LIST_ALREADY_EXISTS = 'A list named "%1" already exists.';
Blockly.Msg.RENAME_LIST_TITLE = 'Rename all "%1" lists to:';
Blockly.Msg.RENAME_LIST_MODAL_TITLE = 'Rename List';
Blockly.Msg.DEFAULT_LIST_ITEM = 'thing';
Blockly.Msg.DELETE_LIST = 'Delete the "%1" list';
Blockly.Msg.RENAME_LIST = 'Rename list';

// Broadcast Messages
// @todo Remove these once fully managed by Scratch VM / Scratch GUI
Blockly.Msg.NEW_BROADCAST_MESSAGE = 'New message';
Blockly.Msg.NEW_BROADCAST_MESSAGE_TITLE = 'New message name:';
Blockly.Msg.BROADCAST_MODAL_TITLE = 'New Message';
Blockly.Msg.DEFAULT_BROADCAST_MESSAGE_NAME = 'message1';


/// tool tips for dive icons. designed to be dinamic
Blockly.Msg.TOOLTIP_DRIVE_FORWARDS_TIME = "Drive forward for "
Blockly.Msg.TOOLTIP_DRIVE_BACKWARDS_TIME = "Drive backward for "
Blockly.Msg.TOOLTIP_DRIVE_LEFT_TIME = "Turn left for "
Blockly.Msg.TOOLTIP_DRIVE_RIGHT_TIME = "Turn right for "
Blockly.Msg.TOOLTIP_DRIVE_LINE_TRACKING_TIME = "Follow a line for "
Blockly.Msg.TOOLTIP_DRIVE_TIME_SECOND = " second"
Blockly.Msg.TOOLTIP_DRIVE_TIME_SECONDS = " seconds"
Blockly.Msg.TOOLTIP_DRIVE_UNITS_DEGREE = " degree"
Blockly.Msg.TOOLTIP_DRIVE_UNITS_DEGREES = " degrees"
Blockly.Msg.TOOLTIP_DRIVE_STOP = "Stop driving"
Blockly.Msg.TOOLTIP_DRIVE_FORWARDS_CONTINUE = "Drive forward"
Blockly.Msg.TOOLTIP_DRIVE_FORWARDS_LEFT_LIGHT = "Drive forward while a light is on the left side"
Blockly.Msg.TOOLTIP_DRIVE_FORWARDS_RIGHT_LIGHT = "Drive forward while a light is on the right side"
Blockly.Msg.TOOLTIP_DRIVE_FORWARDS_LINE_ON_WHITE = "Drive forward while on a white surface"
Blockly.Msg.TOOLTIP_DRIVE_FORWARDS_LINE_ON_BLACK = "Drive forward while on a black surface"
Blockly.Msg.TOOLTIP_DRIVE_BACKWARDS_CONTINUE = "Drive backwards"
Blockly.Msg.TOOLTIP_DRIVE_BACKWARDS_LEFT_LIGHT = "Drive backwards while a light is on the left side"
Blockly.Msg.TOOLTIP_DRIVE_BACKWARDS_RIGHT_LIGHT = "Drive backwards while a light is on the right side"
Blockly.Msg.TOOLTIP_DRIVE_BACKWARDS_LINE_ON_WHITE = "Drive backwards while on a white surface"
Blockly.Msg.TOOLTIP_DRIVE_BACKWARDS_LINE_ON_BLACK = "Drive backwards while on a black surface"
Blockly.Msg.TOOLTIP_DRIVE_LEFT_CONTINUE = "Turn left"
Blockly.Msg.TOOLTIP_DRIVE_LEFT_LEFT_LIGHT = "Turn left while a light is on the left side"
Blockly.Msg.TOOLTIP_DRIVE_LEFT_RIGHT_LIGHT = "Turn left while a light is on the right side"
Blockly.Msg.TOOLTIP_DRIVE_LEFT_LINE_ON_WHITE = "Turn left while on a white surface"
Blockly.Msg.TOOLTIP_DRIVE_LEFT_LINE_ON_BLACK = "Turn left while on a black surface"
Blockly.Msg.TOOLTIP_DRIVE_RIGHT_CONTINUE = "Turn right"
Blockly.Msg.TOOLTIP_DRIVE_RIGHT_LEFT_LIGHT = "Turn right while a light is on the left side"
Blockly.Msg.TOOLTIP_DRIVE_RIGHT_RIGHT_LIGHT = "Turn right while a light is on the right side"
Blockly.Msg.TOOLTIP_DRIVE_RIGHT_LINE_ON_WHITE = "Turn right while on a white surface"
Blockly.Msg.TOOLTIP_DRIVE_RIGHT_LINE_ON_BLACK = "Turn right while on a black surface"
Blockly.Msg.TOOLTIP_DRIVE_LINE_TRACKING_OBSTACLE = "Follow a line until an obstacle is detected"
Blockly.Msg.TOOLTIP_DRIVE_lINE_TRACKING_INFINITE = "Follow a line forever"
Blockly.Msg.TOOLTIP_DRIVE_SPEED_1 = "Set drive speed to slow"
Blockly.Msg.TOOLTIP_DRIVE_SPEED_2 = "Set drive speed to normal"
Blockly.Msg.TOOLTIP_DRIVE_SPEED_3 = "Set drive speed to fast"


//tool tips for the output options
Blockly.Msg.TOOLTIP_LIGHT_SOUND_BOTH_ON = "Turn both LEDs on"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_RIGHT_ON = "Turn right LED on"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_LEFT_ON = "Turn left LED on"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_BOTH_OFF = "Turn both LEDs off"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_RIGHT_OFF = "Turn right LED off"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_LEFT_OFF = "Turn left LED off"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_BEEP = "Beep"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_C_HIGH = "Play a whole C"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_B_HIGH = "Play a whole B"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_A = "Play a whole A"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_G = "Play a whole G"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_F = "Play a whole F"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_E = "Play a whole E"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_D = "Play a whole D"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_C = "Play a whole middle C"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_WHOLE_B = "Play a whole low B"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_C_HIGH = "Play a half C"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_B_HIGH = "Play a half B"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_A = "Play a half A"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_G = "Play a half G"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_F = "Play a half F"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_E = "Play a half E"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_D = "Play a half D"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_C = "Play a half middle C"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_HALF_B = "Play a half low B"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_C_HIGH = "Play a quarter C"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_B_HIGH = "Play a quarter B"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_A = "Play a quarter A"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_G = "Play a quarter G"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_F = "Play a quarter F"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_E = "Play a quarter E"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_D = "Play a quarter D"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_C = "Play a quarter middle C"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_QUARTER_B = "Play a quarter low B"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_C_HIGH = "Play an eighth C"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_B_HIGH = "Play an eighth B"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_A = "Play an eighth A"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_G = "Play an eighth G"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_F = "Play an eighth F"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_E = "Play an eighth E"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_D = "Play an eighth D"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_C = "Play an eighth middle C"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_PLAY_EIGHTH_B = "Play an eighth low B"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_NOTE_SHARP = "Makes the next note sharp";
Blockly.Msg.TOOLTIP_LIGHT_SOUND_NOTE_TEMP_SLOW = "Set music tempo to slow"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_NOTE_TEMP_MEDIUM = "Set music tempo to normal"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_NOTE_TEMP_FAST = "Set music tempo to fast"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_REST_WHOLE = "Play a whole rest"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_REST_HALF = "Play a half rest"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_REST_QUARTER = "Play a quarter rest"
Blockly.Msg.TOOLTIP_LIGHT_SOUND_REST_EIGHTH = "Play a eighth rest"
Blockly.Msg.TOOLTIP_CONTROL_SEND_MESSAGE_1 = "Send blue message"
Blockly.Msg.TOOLTIP_CONTROL_SEND_MESSAGE_2 = "Send pink message"
Blockly.Msg.TOOLTIP_CONTROL_SEND_MESSAGE_3 = "Send green message"
Blockly.Msg.TOOLTIP_CONTROL_SEND_MESSAGE_4 = "Send violet message"
Blockly.Msg.TOOLTIP_CONTROL_SEND_MESSAGE_5 = "Send orange message"
Blockly.Msg.TOOLTIP_CONTROL_SEND_MESSAGE_6 = "Send indigo message"

/// tool tips for the wait until options
Blockly.Msg.event_wait_time = "Wait for "
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_CLAP = "Wait until 1 clap is detected"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_KEY_CIRCLE = "Wait until the round button is pushed"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_KEY_TRIANGLE = "Wait until the triangle button is pushed"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_CLAP_TWO = "Wait until 2 claps are detected"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_LINE_ON_BLACK = "Wait until a black surface is detected"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_LINE_ON_WHITE = "Wait until a white surface is detected"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_LEFT_LIGHT = "Wait until a light is on the left side"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_RIGHT_LIGHT = "Wait until a light is on the right side"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_EVENT_OBSTACLE = "Wait until an obstacle is detected"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_MESSAGE_1 = "Wait until the blue message is received"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_MESSAGE_2 = "Wait until the pink message is received"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_MESSAGE_3 = "Wait until the green message is received"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_MESSAGE_4 = "Wait until the violet message is received"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_MESSAGE_5 = "Wait until the orange message is received"
Blockly.Msg.TOOLTIP_CONTROL_WAIT_MESSAGE_6 = "Wait until the indigo message is received"

///tool tips for the control options
Blockly.Msg.TOOLTIP_CONTROL_LOOP_FOREVER = "Loop forever"
Blockly.Msg.TOOLTIP_CONTROL_LOOP_NUMBER = "Loop "
Blockly.Msg.TOOLTIP_CONTROL_LOOP_NUMBER_TIME = " time"
Blockly.Msg.TOOLTIP_CONTROL_LOOP_NUMBER_TIMES = " times"
Blockly.Msg.TOOLTIP_CONTROL_LOOP_EVENT_KEY_CIRCLE = "Loop until the round button is pushed"
Blockly.Msg.TOOLTIP_CONTROL_LOOP_EVENT_KEY_TRIANGLE = "Loop until the triangle button is pushed"
Blockly.Msg.TOOLTIP_CONTROL_LOOP_OBSTACLE = "Loop until an obstacle is detected"
Blockly.Msg.TOOLTIP_CONTROL_STOP = "End program"

///tool tips for the start events
Blockly.Msg.TOOLTIP_NEW_EVENT_START = "Program start"
Blockly.Msg.TOOLTIP_NEW_EVENT_OBSTACLE = "Start when an obstacle is detected"
Blockly.Msg.TOOLTIP_NEW_EVENT_CLAP = "Start when 1 clap is detected"
Blockly.Msg.TOOLTIP_NEW_EVENT_CLAP_TWO = "Start when 2 claps are detected"
Blockly.Msg.TOOLTIP_NEW_EVENT_KEY_TRIANGLE = "Start when the triangle button is pushed"
Blockly.Msg.TOOLTIP_NEW_EVENT_KEY_CIRCLE = "Start when the round button is pushed"
Blockly.Msg.TOOLTIP_NEW_EVENT_LINE_ON_WHITE = "Start when a white surface is detected"
Blockly.Msg.TOOLTIP_NEW_EVENT_LINE_ON_BLACK = "Start when a black surface is detected"
Blockly.Msg.TOOLTIP_NEW_EVENT_MESSAGE_1 = "Start when the blue message is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_MESSAGE_2 = "Start when the pink message is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_MESSAGE_3 = "Start when the green message is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_MESSAGE_4 = "Start when the violet message is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_MESSAGE_5 = "Start when the orange message is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_MESSAGE_6 = "Start when the indigo message is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_REMOTE_CODE_1 = "Start when remote 1 command is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_REMOTE_CODE_2 = "Start when remote 2 command is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_REMOTE_CODE_3 = "Start when remote 3 command is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_REMOTE_CODE_4 = "Start when remote 4 command is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_REMOTE_CODE_5 = "Start when remote 5 command is received"
Blockly.Msg.TOOLTIP_NEW_EVENT_REMOTE_CODE_6 = "Start when remote 6 command is received"


Blockly.Msg.DEMO_DRIVE_PROGRAM = "Drive example";
Blockly.Msg.DEMO_DRIVE_PROGRAM_DISC = "Drive forward, then turn around and drive back to the start";
Blockly.Msg.DEMO_DRIVE_SPEED = "Drive speed example";
Blockly.Msg.DEMO_DRIVE_SPEED_DISC = "Drive for 1 second at 3 speeds";
Blockly.Msg.DEMO_DRIVE_ON_WHITE = "Drive forward on a white surface example";
Blockly.Msg.DEMO_DRIVE_ON_WHITE_DISC = "Drive forward while on a white surface then turn around";
Blockly.Msg.DEMO_MUSIC = "Music example";
Blockly.Msg.DEMO_MUSIC_DISC = "Play a simple tune";
Blockly.Msg.DEMO_LED = "LED example";
Blockly.Msg.DEMO_LED_DISC = "Flash the right LED";
Blockly.Msg.DEMO_LOOP_UNTIL = "Loop until example";
Blockly.Msg.DEMO_LOOP_UNTIL_DISC = "Beep repeatedly until the round button is pressed";
Blockly.Msg.DEMO_WAIT_UNTIL = "Wait until example";
Blockly.Msg.DEMO_WAIT_UNTIL_DISC = "Wait for a clap before turning on the LEDs then wait for a clap before turning off the LEDs";
Blockly.Msg.DEMO_START_EVENT = "Start event example";
Blockly.Msg.DEMO_START_EVENT_DISC = "Use a start event block to beep every time the triangle button is pressed";
Blockly.Msg.DEMO_SEND_MESSAGE = "Send message example";
Blockly.Msg.DEMO_SEND_MESSAGE_DISC = "Send the blue message after each press of the round button";
Blockly.Msg.DEMO_RECEIVE_MESSAGE_1 = "Receive message example 1";
Blockly.Msg.DEMO_RECEIVE_MESSAGE_1_DISC = "Beep every time the blue message is received";
Blockly.Msg.DEMO_RECEIVE_MESSAGE_2 = "Receive message example 2";
Blockly.Msg.DEMO_RECEIVE_MESSAGE_2_DISC = "Use a start event block to beep every time the blue message is received";
Blockly.Msg.DEMO_AVOID_OBSTACLES = "Avoid obstacles";
Blockly.Msg.DEMO_AVOID_OBSTACLES_DISC = "Drive forward until an obstacle is detected, then back up and turn around before repeating";
Blockly.Msg.DEMO_CLAP_CONTROL = "Clap controlled driving";
Blockly.Msg.DEMO_CLAP_CONTROL_DISC = "Clap once to turn, clap twice to drive forwards";
Blockly.Msg.DEMO_FOLLOW_TORCH = "Follow a torch/flashlight";
Blockly.Msg.DEMO_FOLLOW_TORCH_DISC = "Use the light sensors to follow a flashlight";
Blockly.Msg.DEMO_BOUNCE_IN_BORDERS = "Bounce in borders";
Blockly.Msg.DEMO_BOUNCE_IN_BORDERS_DISC = "Use the line sensor to stay inside a black line border";
