import React, { useMemo, useState } from 'react';

const BELT_CHOICES = [
  { id: 'top-black', label: 'Top Black', level: 'Top', color: 'Black', side: 'Left', pd: 'PD 1', hex: '#111827' },
  { id: 'top-yellow', label: 'Top Yellow', level: 'Top', color: 'Yellow', side: 'Right', pd: 'PD 2', hex: '#ffb500' },
  { id: 'top-orange', label: 'Top Orange', level: 'Top', color: 'Orange', side: 'Full belt', pd: '', hex: '#f97316' },
  { id: 'bottom-red', label: 'Bottom Red', level: 'Bottom', color: 'Red', side: 'Left', pd: '', hex: '#dc2626' },
  { id: 'bottom-yellow', label: 'Bottom Yellow', level: 'Bottom', color: 'Yellow', side: 'Right', pd: '', hex: '#ffb500' },
  { id: 'bottom-green', label: 'Bottom Green', level: 'Bottom', color: 'Green', side: 'Full belt', pd: '', hex: '#16a34a' },
  { id: 'top-blue', label: 'Top Blue', level: 'Top', color: 'Blue', side: 'Left', pd: '', hex: '#2563eb' },
  { id: 'top-red', label: 'Top Red', level: 'Top', color: 'Red', side: 'Right', pd: '', hex: '#dc2626' },
  { id: 'middle-yellow', label: 'Middle Yellow', level: 'Middle', color: 'Yellow', side: 'Left', pd: '', hex: '#ffb500' },
  { id: 'middle-black', label: 'Middle Black', level: 'Middle', color: 'Black', side: 'Right', pd: '', hex: '#111827' },
  { id: 'top-white', label: 'Top White', level: 'Top', color: 'White', side: 'Left', pd: '', hex: '#f8fafc' },
  { id: 'top-green', label: 'Top Green', level: 'Top', color: 'Green', side: 'Right', pd: '', hex: '#16a34a' },
  { id: 'middle-red', label: 'Middle Red', level: 'Middle', color: 'Red', side: 'Left', pd: '', hex: '#dc2626' },
  { id: 'middle-green', label: 'Middle Green', level: 'Middle', color: 'Green', side: 'Right', pd: '', hex: '#16a34a' },
  { id: 'middle-white', label: 'Middle White', level: 'Middle', color: 'White', side: 'Left', pd: '', hex: '#f8fafc' },
  { id: 'middle-blue', label: 'Middle Blue', level: 'Middle', color: 'Blue', side: 'Right', pd: '', hex: '#2563eb' },
];

const QUESTIONS = [
  {
    id: 'nj-chema-070',
    service: 'UPS Ground',
    tracking: '1Z 999 AA1 01 2345 6784',
    slic: '070',
    zip: '07024',
    city: 'Fort Lee, NJ',
    correct: 'top-yellow',
    choices: ['top-black', 'top-yellow', 'bottom-red', 'middle-black', 'top-orange'],
  },
  {
    id: 'ny-chema-100',
    service: 'UPS 2nd Day Air',
    tracking: '1Z 999 AA1 02 8642 1357',
    slic: '100',
    zip: '10019',
    city: 'New York, NY',
    correct: 'top-black',
    choices: ['top-black', 'top-red', 'middle-yellow', 'bottom-green', 'middle-blue'],
  },
  {
    id: 'pa-chema-190',
    service: 'UPS Ground',
    tracking: '1Z 999 AA1 03 5555 0142',
    slic: '190',
    zip: '19047',
    city: 'Langhorne, PA',
    correct: 'bottom-red',
    choices: ['middle-red', 'bottom-red', 'top-blue', 'bottom-yellow', 'top-white'],
  },
  {
    id: 'ct-chema-061',
    service: 'UPS Next Day Air',
    tracking: '1Z 999 AA1 13 2468 0246',
    slic: '061',
    zip: '06103',
    city: 'Hartford, CT',
    correct: 'middle-blue',
    choices: ['middle-white', 'top-green', 'middle-blue', 'top-orange', 'bottom-green'],
  },
  {
    id: 'de-chema-198',
    service: 'UPS Ground Saver',
    tracking: '1Z 999 AA1 04 7777 9021',
    slic: '198',
    zip: '19801',
    city: 'Wilmington, DE',
    correct: 'middle-green',
    choices: ['middle-red', 'middle-green', 'top-yellow', 'bottom-yellow', 'top-blue'],
  },
  {
    id: 'nj-chema-088',
    service: 'UPS Ground',
    tracking: '1Z 999 AA1 05 3131 2209',
    slic: '088',
    zip: '08817',
    city: 'Edison, NJ',
    correct: 'top-orange',
    choices: ['top-orange', 'bottom-green', 'middle-black', 'top-white', 'bottom-red'],
  },
  {
    id: 'ny-chema-117',
    service: 'UPS 3 Day Select',
    tracking: '1Z 999 AA1 12 9090 4410',
    slic: '117',
    zip: '11746',
    city: 'Huntington Station, NY',
    correct: 'top-red',
    choices: ['top-blue', 'top-red', 'middle-yellow', 'middle-white', 'bottom-yellow'],
  },
  {
    id: 'nj-chema-085',
    service: 'UPS Ground',
    tracking: '1Z 999 AA1 07 4242 6018',
    slic: '085',
    zip: '08540',
    city: 'Princeton, NJ',
    correct: 'middle-yellow',
    choices: ['bottom-yellow', 'middle-yellow', 'middle-black', 'top-green', 'top-black'],
  },
];

function getChoice(choiceId) {
  return BELT_CHOICES.find(choice => choice.id === choiceId);
}

function getNextQuestionIndex(currentIndex, total) {
  return currentIndex + 1 >= total ? 0 : currentIndex + 1;
}

function SlicTrainingPanel() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const question = QUESTIONS[questionIndex];
  const correctChoice = getChoice(question.correct);
  const selected = selectedChoice ? getChoice(selectedChoice) : null;
  const answered = Boolean(selectedChoice);
  const isCorrect = selectedChoice === question.correct;
  const accuracy = score.total ? Math.round((score.correct / score.total) * 100) : 0;
  const choiceList = useMemo(() => question.choices.map(getChoice), [question]);

  const chooseAnswer = choiceId => {
    if (answered) {
      return;
    }

    setSelectedChoice(choiceId);
    setScore(current => ({
      correct: current.correct + (choiceId === question.correct ? 1 : 0),
      total: current.total + 1,
    }));
  };

  const nextQuestion = () => {
    setQuestionIndex(current => getNextQuestionIndex(current, QUESTIONS.length));
    setSelectedChoice('');
  };

  const resetPractice = () => {
    setQuestionIndex(0);
    setSelectedChoice('');
    setScore({ correct: 0, total: 0 });
  };

  return (
    <section className="slic-training-panel" id="slic-training">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Sort aisle training</p>
          <h3>SLIC Belt and Transverse Practice</h3>
        </div>
        <span>{score.total ? `${accuracy}% accuracy` : 'Ready'}</span>
      </div>

      <div className="slic-training-layout">
        <article className="dummy-label" aria-label="Dummy UPS training label">
          <div className="label-address-grid">
            <div className="label-from">
              <strong>FROM NAME</strong>
              <span>FROM PHONE</span>
              <span>FROM ADDRESS 1</span>
              <span>FROM ADDRESS 2</span>
              <span>FROM CITY, STATE, ZIP</span>
            </div>
            <div className="label-weight">
              <strong>WEIGHT LBS X OF TOTAL</strong>
              <span>DWT: DWT:</span>
              <span>AH</span>
            </div>
          </div>

          <div className="label-shipto">
            <strong>SHIP<br />TO:</strong>
            <div>
              <span>TO NAME</span>
              <span>TO PHONE</span>
              <span>TO ADDRESS 1</span>
              <span>TO ADDRESS 2</span>
              <span>TO ADDRESS 3</span>
              <em>{question.city}</em>
              <b>{question.zip}</b>
            </div>
          </div>

          <div className="label-routing">
            <div className="label-matrix">
              <span />
              <span />
            </div>
            <div className="label-route-code">
              <strong>HI {question.slic} 9-02</strong>
              <div className="label-barcode label-barcode-small" aria-hidden="true" />
            </div>
          </div>

          <div className="label-service-band">
            <strong>{question.service.toUpperCase()}</strong>
            <span>1</span>
          </div>

          <div className="label-tracking">TRACKING # {question.tracking}</div>
          <div className="label-barcode label-barcode-large" aria-hidden="true" />
          <div className="label-footer">
            <strong>ADDITIONAL ROUTING INS.</strong>
            <strong>ADDITIONAL ROUTING INS.</strong>
          </div>
        </article>

        <div className="slic-quiz-card">
          <div className="quiz-copy">
            <span>Question {questionIndex + 1} of {QUESTIONS.length}</span>
            <strong>Which belt should this package go to?</strong>
          </div>

          <div className="belt-choice-grid">
            {choiceList.map(choice => {
              const choiceState = answered && choice.id === question.correct
                ? 'correct'
                : answered && choice.id === selectedChoice
                  ? 'incorrect'
                  : '';

              return (
                <button
                  className={`belt-choice ${choiceState}`}
                  key={choice.id}
                  type="button"
                  onClick={() => chooseAnswer(choice.id)}
                  disabled={answered}
                >
                  <span style={{ '--belt-color': choice.hex }} />
                  <strong>{choice.label}</strong>
                  <em>{choice.side} transverse{choice.pd ? ` - ${choice.pd}` : ''}</em>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`} role="status">
              <strong>{isCorrect ? 'Correct sort' : 'Review this one'}</strong>
              <p>
                {question.slic} / {question.zip} goes to {correctChoice.label}, {correctChoice.side.toLowerCase()} transverse
                {correctChoice.pd ? `, ${correctChoice.pd}` : ''}.
                {!isCorrect && selected ? ` You selected ${selected.label}.` : ''}
              </p>
            </div>
          )}

          <div className="quiz-actions">
            <button type="button" onClick={nextQuestion}>Next Label</button>
            <button type="button" onClick={resetPractice}>Reset Score</button>
          </div>
        </div>

        <aside className="belt-map-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CHEMA map</p>
              <h3>Belt Color Splits</h3>
            </div>
          </div>
          <div className="belt-map-list">
            <div><span>Top</span><strong>Black / Yellow</strong><em>PD 1 / PD 2</em></div>
            <div><span>Top</span><strong>Blue / Red</strong><em>Left / Right transverse</em></div>
            <div><span>Top</span><strong>White / Green</strong><em>Left / Right transverse</em></div>
            <div><span>Top</span><strong>Orange</strong><em>Full belt</em></div>
            <div><span>Middle</span><strong>Yellow / Black</strong><em>Left / Right transverse</em></div>
            <div><span>Middle</span><strong>Red / Green</strong><em>Left / Right transverse</em></div>
            <div><span>Middle</span><strong>White / Blue</strong><em>Left / Right transverse</em></div>
            <div><span>Bottom</span><strong>Red / Yellow</strong><em>Left / Right transverse</em></div>
            <div><span>Bottom</span><strong>Green</strong><em>Full belt</em></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default SlicTrainingPanel;
