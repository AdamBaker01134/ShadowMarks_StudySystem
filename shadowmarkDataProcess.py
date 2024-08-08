import datetime
import sys
import csv
csv.field_size_limit(100000000)


def cleanTrialRow(participantLogDict):
    trialLog = participantLogDict["trialLog"]
    trialArray = trialLog.split("|")
    i = 0
    for trial in trialArray:
        trialData = trial.split(",")
        trialArray[i] = trialData
        i += 1
    trialArray = trialArray[0:-1]
    trialArray[0][0] = "pID"
    return trialArray


def cleanStreamRow(participantLogDict):
    streamLog = participantLogDict["streamLog"]
    streamArray = streamLog.split("|")
    i = 0
    for streamTrial in streamArray:
        streamData = streamTrial.split(",")
        streamArray[i] = streamData
        i += 1
    streamArray = streamArray[0:-1]
    streamArray[0][0] = "pID"
    return streamArray

def cleanErrorRow(participantLogDict):
    errorLog = participantLogDict["errorLog"]
    errorArray = errorLog.split("|")
    i = 0
    for errorTrial in errorArray:
        errorData = errorTrial.split(",")
        errorArray[i] = errorData
        i += 1
    errorArray = errorArray[0:-1]
    errorArray[0][0] = "pID"
    errorArray[0].append("timestamp")
    errorArray[1].append(participantLogDict["timeSubmitted"])
    return errorArray


def combineEntries(rows):
    header = []
    entries = []
    for row in rows:
        if len(row) > 0:
            header = row[0]
            # header.insert(0, "entry")
            count = 1

            i = 0
            for entry in row:
                if i != 0:
                    # entry.insert(0, count)
                    entries.append(entry)
                    count += 1

                i += 1
    return [header, entries]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <csv_file>")
        sys.exit(1)

    csv_file_path = sys.argv[1]

    with open(csv_file_path, mode="r", newline="") as file:
        reader = csv.DictReader(file)

        trialRows = []
        streamRows = []
        errorRows = []
        i = 0
        for participant in reader:
            cleanedParticipantLog = ""
            cleanedParticipantStream = ""
            cleanedParticipantError = ""

            if ("trialLog" in dict(participant) and len(dict(participant)["trialLog"]) > 2):
                cleanedParticipantLog = cleanTrialRow(dict(participant))
                trialRows.append(cleanedParticipantLog)

            if ("streamLog" in dict(participant) and len(dict(participant)["streamLog"]) > 2):
                cleanedParticipantStream = cleanStreamRow(dict(participant))
                streamRows.append(cleanedParticipantStream)

            if ("errorLog" in dict(participant) and len(dict(participant)["errorLog"]) > 2):
                cleanedParticipantError = cleanErrorRow(dict(participant))
                errorRows.append(cleanedParticipantError)

        combinedTrialEntries = combineEntries(trialRows)
        combinedStreamEntries = combineEntries(streamRows)
        combinedErrorEntries = combineEntries(errorRows)

        today = datetime.datetime.now().date()
        csvName = "data/shadowmarksTrialData_{}.csv".format(today.isoformat())
        with open(csvName, mode="w", newline="", encoding="utf-8") as csvFile:
            writer = csv.writer(csvFile)
            writer.writerow(combinedTrialEntries[0])
            writer.writerows(combinedTrialEntries[1])

        csvName = "data/shadowmarksStreamData_{}.csv".format(today.isoformat())
        with open(csvName, mode="w", newline="", encoding="utf-8") as csvFile:
            writer = csv.writer(csvFile)
            writer.writerow(combinedStreamEntries[0])
            writer.writerows(combinedStreamEntries[1])

        csvName = "data/shadowmarksErrorData_{}.csv".format(today.isoformat())
        with open(csvName, mode="w", newline="", encoding="utf-8") as csvFile:
            writer = csv.writer(csvFile)
            writer.writerow(combinedErrorEntries[0])
            writer.writerows(combinedErrorEntries[1])
