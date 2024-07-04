import datetime
from flask import Blueprint, render_template
from BOFS.util import *
from BOFS.globals import db
from BOFS.admin.util import verify_admin
from BOFS.default.views import route_instructions

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

@my_task.route("/tutorials/<tutorial>", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def tutorials(tutorial):
    return comparisonStudy(tutorial, 0, True)

@my_task.route("/instructions/<interaction>/<pageName>", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def instructions(interaction, pageName):
    return route_instructions(pageName)

@my_task.route("/shadowMarkers", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def comparisonStudy(interaction, task, tutorial=False):
    # interaction is the variable passed from custom routes

    # getting the participant ID from the session variable
    # We can get this into our javascript. Shown in shapeDrawing.html
    pID = session["participantID"]

    # the condition assigned to the participant from our page list
    condition = session["condition"]

    if request.method == 'POST':
        if 'trialLog' in request.form:
            log = db.comparisonStudy()  # This database table was defined in /tables/comparisonStudy.json
            # writing columns from our javascript to the log
            log.participantID = pID
            log.trialLog = request.form['trialLog']

            # adding the participant log to the database
            db.session.add(log)
            db.session.commit()

        # if a post request occured redirect
        return redirect("/redirect_next_page")
    
    # if no post, render our custom html with these variables
    return render_template("simple/shadowMarkers.html", pID = pID, interaction = interaction, task = task, tutorial = tutorial)