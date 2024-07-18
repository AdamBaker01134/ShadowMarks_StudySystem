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
            observations.append({"pID": pID, "condition": condition,
                                "interaction": interaction, "task": task, "question": question, "value": row[key[0] + restOfThing]})
    return observations


def getFavourites(row):
    pID = row["participantID"]
    condition = row["condition"]
    observations = []

    for key in row:
        key = key.split("_")
        if key[0] == "summary" and key[1] != "duration":
            restOfThing = ""
            for i in range(1, len(key)):
                restOfThing += "_" + key[i]

            observations.append({"pID": pID, "condition": condition,
                                "question": key[1], "value": row[key[0] + restOfThing]})

    return observations


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

        for participant in reader:
            row = dict(participant)
            demographicRows.extend(getDemographics(row))
            TLXRows.extend(getTLXPreferences(row))
            preferenceRows.extend(getFavourites(row))

        today = datetime.datetime.now().date()
        dict_to_csv(demographicRows,
                    "shadowmarksDemographicsData_{}.csv".format(today.isoformat()))
        dict_to_csv(TLXRows, "shadowmarksTLXData_{}.csv".format(today.isoformat()))
        dict_to_csv(preferenceRows,
                    "shadowmarksPreferenceData_{}.csv".format(today.isoformat()))
