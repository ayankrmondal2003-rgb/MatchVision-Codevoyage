from SoccerNet.Downloader import SoccerNetDownloader

downloader = SoccerNetDownloader(
    LocalDirectory="data/soccernet"
)

game = (
    "europe_uefa-champions-league/"
    "2016-2017/"
    "2017-04-18 - 21-45 Real Madrid 4 - 2 Bayern Munich"
)

print("Starting SoccerNet download...")

downloader.downloadGame(
    game=game,
    files=["1_720p.mkv"],
    source="HuggingFace"
)

print("Download process finished.")