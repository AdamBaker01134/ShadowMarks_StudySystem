import datetime
from flask import Blueprint, render_template
from BOFS.util import *
from BOFS.globals import db
from BOFS.admin.util import verify_admin

# The name of this variable must match the folder's name.
my_task = Blueprint('my_task', __name__,
                         static_url_path='/my_task',
                         template_folder='templates',
                         static_folder='static')


@my_task.route("/shadowMarkers/<task>/smallMultiples", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def smallMultiples(task):
    return comparisonStudy("smallMultiples", int(task))

@my_task.route("/shadowMarkers/<task>/overlays", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def overlays(task):
    return comparisonStudy("overlays", int(task))

@my_task.route("/shadowMarkers/<task>/shadowMarkers", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def shadowMarkers(task):
    return comparisonStudy("shadowMarkers", int(task))

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
        log = db.comparisonStudy()  # This database table was defined in /tables/comparisonStudy.json
        # writing columns from our javascript to the log
        log.trialLog = request.form['trialLog']
        log.streamLog = request.form['streamLog']

        # adding the participant log to the database
        db.session.add(log)
        db.session.commit()

        # if a post request occured redirect
        return redirect("/redirect_next_page")
    
    # if no post, render our custom html with these variables
    return render_template("simple/shadowMarkers.html", pID = pID, interaction = interaction, task = task)


