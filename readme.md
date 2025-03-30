A simple Discord bot for tracking who has the tag.
# Slash Commands:
- **/init** – Randomly assigns a player the tag and creates the roles _Banana Toucher_ and _Banana_.
- **/join** – Adds the player to the database, making them taggable.
- **/tag** – Allows the player to tag another player and records the tagging sequence in the database.
- **/adminTag** – Transfers the tag from one player to another and records the tagging sequence in the database.
- **/randomTag** - Gives a random tag to a player.
- **/history** - Shows the last tags.
The person who has the tag should get the *Banana Toucher* role, anyone else who is a participant should have the *Banana* role. This process is done by using utils/syncServerState.js which will update everyone based on the table. Reason for working this way because there aren't too many people playing and this makes the code easier. 
# Known Problems
- So far none! 
# Some QOL changes that may happen.
- Doesn't display the page number in /history (this is actually kind of annoying to do) 
- An admin dashboard.
# Some history
- First Banana Touch did not have a bot
- Second Banana Touch had a bot that was in trash_code branch
- Third (and final) Banana Touch was written since the last one's code was too trashy to build ontop of and we needed a database