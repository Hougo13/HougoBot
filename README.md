# HougoBot

A simple dicord bot who play random music in a directory.

### Install

1. `git clone`
2. `npm install`
 
### Configure

edit `bot.json`
```json
[
  {
    "email": "youremail@.com",
    "password": "yourpassword"
  },
  {
    "textChan": "name_of_textChan_where_bot_put_playing_info",
    "voiceChan": "name_of_voiceChan_where_bot_play_music"
  },
  {
    "musicDir": "C:/Users/Public/Music"
  }
]
```

### Run

`npm start`
