from flask import Flask, render_template,url_for,request,redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'

# intialize database
db = SQLAlchemy(app)

# create database model for list of defined question
class QuestionAns(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    question = db.Column(db.String(200),nullable=False)
    humanize = db.Column(db.String(200),nullable=False)
    answer = db.Column(db.String(200),nullable=False)
    category = db.Column(db.String(50),nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

class QuestionUser(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    question = db.Column(db.String(200),nullable=False)
    answer = db.Column(db.String(500),nullable=True)
    category = db.Column(db.String(50),nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

class Askedq(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    category = db.Column(db.String(200),nullable=False)


@app.route('/', methods=['GET'])
def index():
    content = QuestionUser.query.all()
    return render_template('index.html',qna=content)

# link: https://www.youtube.com/watch?v=4jY57Ehc14Y
def Search(pat,txt):
    N = len(txt)
    M = len(pat)
    lps = [0]*M
    computeLPSArray(pat,M,lps)
    i = 0
    j = 0
    while i<N:
        if txt[i]==pat[j]:
            i+=1
            j+=1
        else:
            if j!=0:
                j = lps[j-1]
            else:
                i+=1
        if j==M:
            return True
    return False

def computeLPSArray(pat,M,lps):
    l = 0
    i = 1
    lps[0] = 0
    while i<M:
        if pat[i]==pat[l]:
            lps[i] = l + 1
            l+=1
            i+=1
        else:
            if l!=0:
                l = lps[l-1]
            else:
                lps[i] = 0
                i+=1
    return lps     


@app.route('/kmp', methods=['GET','POST'])
def process_kmp():
    if request.method=='POST':
        user_questions = request.form['question']
        
        score_per_ques = {}
        list_questions = {}
        list_questions_cat = {}
        for qna in QuestionAns.query.all():
            list_questions[qna.question] = qna.answer
            list_questions_cat[qna.question] = qna.category
        for ques in list_questions.keys():
            score_per_ques[ques] = 0
            for word in ques.split(' '):
                if word!='':
                    bol = int(Search(word,user_questions)) 
                    score_per_ques[ques]+=bol

        chosen_ques = max(score_per_ques,key=score_per_ques.get)                                                   
                                                             
        if score_per_ques[chosen_ques]>0:
            jawaban = list_questions[chosen_ques]
        else:
            jawaban = 'Saudara akan dihubungkan ke staff kami tentang ini'
        
        # add category of question in askedq
        new_askedq = Askedq(category = list_questions_cat[chosen_ques])
        try:
            db.session.add(new_askedq)
            db.session.commit()
        except:
            return "There was an issue adding your category"
        

        # category question in database
        qnas = QuestionAns.query.all()
        set_cat_qna = set()
        for qna in qnas:
            set_cat_qna.add(qna.category)

        # category question by user
        qnas = Askedq.query.all()
        set_cat_user = set()
        for qna in qnas:
            set_cat_user.add(qna.category)
        
        not_asked = []
        for cat in set_cat_qna:
            if cat not in set_cat_user:
                not_asked.append(cat)
        

        if len(not_asked)>0:
            # question not asked with that category
            not_asked_q = QuestionAns.query.filter_by(category=not_asked[0]).first()
            another_q = not_asked_q.humanize
        
            # gabungin jawaban dan try interaction
            jawaban = f'{jawaban}. Apakah saudara memiliki pertanyaan lain. Mungkin saudara ingin mengetahui tentang {another_q}. Saya bisa membantu saudara menjawabnya'
        
        # add user question to database
        if score_per_ques[chosen_ques]>0:
            new_userq = QuestionUser(question = user_questions, answer=jawaban, category=list_questions_cat[chosen_ques])
        else:
            new_userq = QuestionUser(question = user_questions, answer=jawaban, category='other')
        try:
            db.session.add(new_userq)
            db.session.commit()
        except:
            return "There was an issue adding your question and answer for user"

        content = QuestionUser.query.all()
        return render_template('index.html',qna=content)

                                              

@app.route('/addqa', methods=['GET','POST'])
def add_qa():
    if request.method=='POST':
        ques = request.form['question']
        ans = request.form['answer']
        human = request.form['humanize']
        cat = request.form['category']
        new_qna = QuestionAns(question = ques, answer=ans, humanize=human, category=cat)
        
        try:
            db.session.add(new_qna)
            db.session.commit()
        except:
            return "There was an issue adding your question and answer"
    
    qnas = QuestionAns.query.order_by(QuestionAns.date_created).all()
    return render_template('add_qa.html',qna = qnas)

@app.route('/delete/<int:id>', methods=['GET','POST'])
def delete(id):
    qna_to_delete = QuestionAns.query.get_or_404(id)
    try:
        db.session.delete(qna_to_delete)
        db.session.commit()
        return redirect('/addqa')
    except:
        return 'There was a problem deleting that task'
    
@app.route('/deleteU/<int:id>/delA/<string:cat>', methods=['GET','POST'])
def delete_u(id,cat):
    qna_to_delete = QuestionUser.query.get_or_404(id)
    db.session.delete(qna_to_delete)
    db.session.commit()

    cat_to_delete = Askedq.query.filter_by(category=cat).all()

    # mungkin try except ini ga perlu, tapi udah terlanjur saya tulis di banyak tempat
    for c in cat_to_delete:
        try:
            db.session.delete(c)
            db.session.commit()
        except:
            return 'There was a problem deleting that task'
    return redirect('/')


@app.route('/update/<int:id>', methods=['GET','POST'])
def update(id):
    qna = QuestionAns.query.get_or_404(id)
    if request.method=='POST':
        try:
            qna.question = request.form['question']
            qna.answer = request.form['answer']
            qna.humanize = request.form['humanize']
            qna.category = request.form['category']
            db.session.commit()
            return redirect('/addqa')
        except:
            return 'There was a problem updating that question and answer'
    else:
        return render_template('update.html',qna=qna)

if __name__=="__main__":
    app.run(debug=True)