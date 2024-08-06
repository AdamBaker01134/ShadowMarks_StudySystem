import datetime
from flask import Blueprint, render_template
from BOFS.util import *
from BOFS.globals import db
from BOFS.admin.util import verify_admin
from BOFS.default.views import route_instructions,route_redirect_to_page

# The name of this variable must match the folder's name.
my_task = Blueprint('my_task', __name__,
                         static_url_path='/my_task',
                         template_folder='templates',
                         static_folder='static')


@my_task.route("/shadowMarkers/<task>/smallMultiples", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def smallMultiples(task):
    return comparisonStudy("smallMultiples", task)

@my_task.route("/shadowMarkers/<task>/overlays", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def overlays(task):
    return comparisonStudy("overlays", task)

@my_task.route("/shadowMarkers/<task>/shadowMarkers", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def shadowMarkers(task):
    return comparisonStudy("shadowMarkers", task)

@my_task.route("/fullscreen/<pageNum>", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def fullscreenVerification(pageNum):
    return route_instructions("fullscreen")

@my_task.route("/oops/<errCode>/<task>/<interaction>", methods=['GET', 'POST'])
@verify_correct_page
@verify_session_valid
def oops(errCode, task, interaction):
    if request.method == 'POST':
        return route_redirect_to_page("shadowMarkers/" + task + "/" + interaction)
    else:
        log = db.comparisonStudy()  # This database table was defined in /tables/comparisonStudy.json
        # writing columns from our javascript to the log
        pID = session["participantID"]
        log.participantID = pID
        log.errorLog = "pID,errCode|" + str(pID) + "," + str(errCode) + "|"

        # adding the participant log to the database
        db.session.add(log)
        db.session.commit()
        if errCode == "1":
            return route_instructions("hiddenpage")
        elif errCode == "2":
            return route_instructions("leftpage")
        else:
            return route_instructions("fullscreen")

@my_task.route("/shadowMarkers", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def comparisonStudy(interaction, task):
    # interaction is the variable passed from custom routes

    # getting the participant ID from the session variable
    # We can get this into our javascript. Shown in shapeDrawing.html
    pID = session["participantID"]

    # the condition assigned to the participant from our page list
    condition = session["condition"]

    if request.method == 'POST':
        if 'trialLog' in request.form and 'streamLog' in request.form:
            log = db.comparisonStudy()  # This database table was defined in /tables/comparisonStudy.json
            # writing columns from our javascript to the log
            log.participantID = pID
            log.trialLog = request.form['trialLog']
            log.streamLog = request.form['streamLog']

            # adding the participant log to the database
            db.session.add(log)
            db.session.commit()

        # if a post request occured redirect
        return redirect("/redirect_next_page")
    
    # if no post, render our custom html with these variables
    return render_template("simple/shadowMarkers.html", pID = pID, interaction = interaction, task = task, condition = condition)