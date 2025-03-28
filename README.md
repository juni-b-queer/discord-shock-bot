# Discord Shock Bot
A bot for managing and controlling users' openshock devices from within a discord server

Commands

- `/shock {user} {intensity} {duration} {shocker?}` \
Shock a user. If no shocker is specified, user default or all shockers will be used
- `/vibrate {user} {intensity} {duration} {shocker?}` \
Vibrate a users shocker. If no shocker is specified, user default or all shockers will be used
- `/repeat {user} {sequence} {repetitions} {shocker?}` \
Run a repeated sequence of actions, Shock or Vibrate, defined by the sequence string ({s,v}-{intensity}-{seconds})
- `/sequence {user} {sequence} {shocker?}` \
Run a sequence of actions, Shock or Vibrate, defined by the sequence string ({s,v}-{intensity}-{seconds})
- `/list {user?}` \
If no user is provided, list all users with shockers setup in the server. If a user is provided, list all shockers for that user
- `/pause` \
Pause control of your shockers. Users will not be able to shock you until you unpause
- `/unpause` \
Unpause control of your shockers.
- `/setlimit {intensityLimit}` \
Set the max intensity for your shockers. Between 1 and 100
- `/setdefault {shocker}` \
Set the default shocker for you. If no default is selected, when a control command is sent to you without a shocker, all shockers will be used
- `/shockhelp` \
Show this message :)
- `/setup` \
Admin only, sets up the init message in the server