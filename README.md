Collaborative Version : 
https://docs.google.com/document/d/1U30FLGgXsUcconFvlvZ_Tiv2GbogxrHIc-Jqn5xpH_Q/edit?usp=sharing

Asset Credit: [Sprout Lands - Asset Pack by Cup Nooble](https://cupnooble.itch.io/sprout-lands-asset-pack)

# Devlog Entry #1 - 11/17/2024

## Introducing the Team
* Carolyn Hope - Design Lead
* Ian Stentz - Tools Lead
* Lorraine Torres - Engine Lead
* Chase Croy-Perrett - Assistant Design Lead

## Tools and Materials
* We will be using Phaser as a 2D framework primarily because all our engineers have past experience with Phaser. Phaser’s modular structure would allow team members to focus on different aspects of the game (physics, graphics, or input handling) while maintaining smooth collaboration. Phaser 3 and its libraries also offer many built-in-tools for asset management, physics, and rendering, enabling quick prototyping and iteration. Phaser also provides extensive documentation to facilitate resource finding and troubleshooting, allowing our team to implement an efficient game.
* We will be using Javascript with Phaser and JSON, as this will allow rapid development and deployment of the 2D web-based game we’re aiming to make for this project. Javascript and Phaser are tools all of us are familiar with, which will allow us to spend less time grappling with the engine and more time implementing features and ensuring the organization and memory-efficiency of our codebase. Finally, we hope to use JSON as a tool to manage different kinds of game objects and quickly add new ones to the project.  
* We expect to use Visual Studio Code for code authoring throughout the project, and since Phaser allows the importing of 2D assets with extreme ease, we will use Paint.net - which Carolyn feels skilled in and will lead the rest of us on - for the creation of visual assets. If necessary, we will also be using Tiled if our game ends up needing a tiled world (it probably will be - given the theme), and it is both an easy tool to use and a familiar one, thanks to 120.
* Our platform switch will be from javascript to typescript. We feel like this is a meaningful change because though we are keeping Phaser, which will help greatly with displaying images, typescript will require us to restructure our code - unlike, for example, how a change from typescript to javascript might go. We chose typescript because it is familiar to all of us, and the platform switch options with other common game engines like Unity seemed to go too obscure.

## Outlook
While other teams may focus on a simple farming simulator, we intend to focus on the act of creating new crops by cross-pollination. We anticipate that the most challenging part of the project will be to implement consistent formatting between code and clear documentation. We hope to learn how to implement the various design patterns and learn what development in Javascript looks like from beginning-to-end.

# Devlog Entry #2 - 11/29/2024

## How we satisfied the software requirements
For our assignment, we represent the game as a 6x6 grid of tiles in top-down view. There is a character represented currently by a basic sprite that can navigate the grid by using “WASD” or the arrow keys, which will cause them to move one tile in the corresponding direction. Players advance time manually one frame at a time by either moving to another tile or pressing “Space.” The player can use “1/2/3” to select the corresponding seed packet (no visual feedback for this yet), and then can use left click on either the cell the player is occupying or one of the adjacent cells in order to plant the crop. As time progresses (as previously described), the plants will grow. They both require a certain amount of moisture and a certain amount of sunlight, varying by plant, and will individually grow given those conditions are fulfilled. The player can left click a fully grown crop in order to harvest it. Once the player has harvested at least one of each plant type, the game ends and displays “You won” to the screen.

## Reflection
Our initial plan was to use the Phaser library however as we began working through the initial requirements we opted for the p5.js library because its built-in functions gave us a simple and flexible way to build a 2D grid-based game without the need for complex tilemap rendering. While our project has the required gameplay of player movement, planting crops, harvesting, and simulating environmental changes, it doesn't need the features of a full-fledged game engine like Phaser. Instead, we chose to meet the requirements with p5.js for its flexibility in drawing graphics and handling basic interactivity. We may utilize Phaser’s features in the future for UI feedback and scene management. We also added Live Server to our list of developmental tools so we could launch our web page (index.html) in the browser and automatically see the changes we made before committing to the main branch.
