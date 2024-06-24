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


@my_task.route("/shapeDrawing/aimkeys", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def aimkeys():
    return shapeDrawing("aimkeys")

@my_task.route("/shapeDrawing/shortcuts", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def shortcuts():
    return shapeDrawing("shortcuts")

@my_task.route("/shapeDrawing/toolbar", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def toolbar():
    return shapeDrawing("toolbar")



@my_task.route("/shapeDrawing", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def shapeDrawing(interaction):
    # interaction is the variable passed from custom routes

    # getting the participant ID from the session variable
    # We can get this into our javascript. Shown in shapeDrawing.html
    pID = session["participantID"]

    # the condition assigned to the participant from our page list
    condition = session["condition"]

    if request.method == 'POST':
        log = db.shapeDrawing()  # This database table was defined in /tables/shapeDrawing.json
        # writing columns from our javascript to the log
        log.trialLog = request.form['trialLog']
        log.streamLog = request.form['streamLog']

        # adding the participant log to the database
        db.session.add(log)
        db.session.commit()

        # if a post request occured redirect
        return redirect("/redirect_next_page")
    
    # if no post, render our custom html with these variables
    return render_template("simple/shapeDrawing.html", pID = pID, interaction = interaction)


