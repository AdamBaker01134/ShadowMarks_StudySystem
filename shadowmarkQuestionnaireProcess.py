import datetime
import sys
import csv
csv.field_size_limit(100000000)


def getDemographics(row):
    pID = row["participantID"]
    condition = row["condition"]

    rowDict = {"pID": pID, "condition": condition}
    for key in row:
        key = key.split("_")
        if key[0] == "demographics" and "data_visualizations_1" not in key and key[1] != "duration":
            restOfThing = ""
            for i in range(1, len(key)):
                restOfThing += "_" + key[i]
            if key[1] == "identify":
                if key[2] == "2":
                    if row[key[0] + restOfThing] != "":
                        rowDict["identify"] = row[key[0] + restOfThing]
                else:
                    rowDict["identify"] = row[key[0] + restOfThing]
            elif key[1] == "age":
                rowDict["age"] = row[key[0] + restOfThing]
            elif key[1] == "computer" and key[2] == "experience":
                rowDict["ComputerExperience"] = row[key[0] + restOfThing]
            elif key[1] == "games" and key[2] == "experience":
                rowDict["GamesExperience"] = row[key[0] + restOfThing]
            elif key[1] == "video":
                if key[2] == "editing":
                    rowDict["VideoEditingExperience"] = row[key[0] + restOfThing]
                elif key[2] == "comparison":
                    rowDict["VideoComparisonExperience"] = row[key[0] + restOfThing]
            elif key[1] == "visualization":
                if key[2] == "experience":
                    rowDict["VisualizationExperience"] = row[key[0] + restOfThing]
                elif key[2] == "comparison":
                    rowDict["VisualizationComparisonExperience"] = row[key[0] + restOfThing]
            elif key[1] == "line":
                rowDict["LineChartExperience"] = row[key[0] + restOfThing]
            elif key[1] == "bar":
                rowDict["BarChartExperience"] = row[key[0] + restOfThing]
            elif key[1] == "scatter":
                rowDict["ScatterplotExperience"] = row[key[0] + restOfThing]
            elif key[1] == "area":
                rowDict["AreaChartExperience"] = row[key[0] + restOfThing]
            elif key[1] == "pie":
                rowDict["PieChartExperience"] = row[key[0] + restOfThing]
            elif key[1] == "box":
                rowDict["BoxWhiskerExperience"] = row[key[0] + restOfThing]  
    return [rowDict]


def getTLXPreferences(row):
    pID = row["participantID"]
    condition = row["condition"]
    observations = []
    for key in row:
        key = key.split("_")
        if "nasa-tlx" in key[0] and key[1] != "duration":
            restOfThing = ""
            for i in range(1, len(key)):
                restOfThing += "_" + key[i]
            interaction = key[0].split("/")[1]
            task = interaction[-1]
            interaction = interaction[:-1]
            if interaction == "shadowMarkers":
                interaction = "shadowmarkers"
            question = ""
            if key[2] == "1":
                question = "MentalDemand"
            elif key[2] == "2":
                question = "PhysicalDemand"
            elif key[2] == "3":
                question = "TemporalDemand"
            elif key[2] == "4":
                question = "Performance"
            elif key[2] == "5":
                question = "Effort"
            elif key[2] == "6":
                question = "Frustration"
            elif key[2] == "7":
                question = "Guessing"
            elif key[2] == "8":
                question = "PerceivedAccuracy"
            elif key[2] == "9":
                question = "TaskDifficulty"
            elif key[2] == "10":
                question = "TechniqueDifficulty"
            observations.append({"pID": pID, "condition": condition,
                                "interaction": interaction, "task": task, "question": question, "value": row[key[0] + restOfThing]})
    return observations


def getFavourites(row):
    pID = row["participantID"]
    condition = row["condition"]
    
    speed_preference = {}
    accuracy_preference = {}
    overall_preferene = {}

    for key in row:
        key = key.split("_")
        if key[0][:-1] == "summary" and key[1] != "comments" and key[1] != "duration":
            restOfThing = ""
            for i in range(1, len(key)):
                restOfThing += "_" + key[i]
            if key[1] == "speed" and key[2] != "reason":
                speed_preference["pID"] = pID
                speed_preference["condition"] = condition
                speed_preference["question"] = key[1]
                speed_preference["answer"] = row[key[0] + restOfThing]
            elif key[1] == "speed":
                speed_preference["reason"] = row[key[0] + restOfThing]
            elif key[1] == "accuracy" and key[2] != "reason":
                accuracy_preference["pID"] = pID
                accuracy_preference["condition"] = condition
                accuracy_preference["question"] = key[1]
                accuracy_preference["answer"] = row[key[0] + restOfThing]
            elif key[1] == "accuracy":
                accuracy_preference["reason"] = row[key[0] + restOfThing]
            elif key[1] == "preference" and key[2] != "reason":
                overall_preferene["pID"] = pID
                overall_preferene["condition"] = condition
                overall_preferene["question"] = key[1]
                overall_preferene["answer"] = row[key[0] + restOfThing]
            elif key[1] == "preference":
                overall_preferene["reason"] = row[key[0] + restOfThing]

    return [ speed_preference, accuracy_preference, overall_preferene]

def getComments(row):
    pID = row["participantID"]
    condition = row["condition"]

    commentsDict = {"pID": pID, "condition": condition}

    for key in row:
        key = key.split("_")
        if key[0][:-1] == "summary" and key[1] == "comments":
            restOfThing = ""
            for i in range(1, len(key)):
                restOfThing += "_" + key[i]
            commentsDict["comments"] = row[key[0] + restOfThing]  
    return [commentsDict]
        


def dict_to_csv(list_of_dicts, csv_file):
    # Extract the header from the keys of the first dictionary
    header = list_of_dicts[0].keys()

    with open("data/"+csv_file, 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=header)
        writer.writeheader()
        writer.writerows(list_of_dicts)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <csv_file>")
        sys.exit(1)

    csv_file_path = sys.argv[1]

    with open(csv_file_path, mode="r", newline="") as file:
        reader = csv.DictReader(file)

        TLXRows = []
        demographicRows = []
        preferenceRows = []
        commentRows = []

        for participant in reader:
            row = dict(participant)
            demographicRows.extend(getDemographics(row))
            TLXRows.extend(getTLXPreferences(row))
            preferenceRows.extend(getFavourites(row))
            commentRows.extend(getComments(row))

        today = datetime.datetime.now().date()
        dict_to_csv(demographicRows,"shadowmarksDemographicsData_{}.csv".format(today.isoformat()))
        dict_to_csv(TLXRows,"shadowmarksTLXData_{}.csv".format(today.isoformat()))
        dict_to_csv(preferenceRows,"shadowmarksPreferenceData_{}.csv".format(today.isoformat()))
        dict_to_csv(commentRows,"shadowmarksCommentsData_{}.csv".format(today.isoformat()))
