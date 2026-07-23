const monogoose = require('mongoose');
const {Schema} = monogoose;

const problemSchema = new Schema({
  title: {
    type: String,
    required: true,
 
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 200
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
    tags: {
        type: [String], 
        enum: ['arrays', 'strings', 'math', 'dynamic programming', 'graphs', 'trees', 'sorting', 'searching'],
        required: true
    },
    visibleTestCases: [
        {
          input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        },
        explanation: {
            type: String,
            required: true
        }

    }
    ],
    hiddenTestCases: [ 
        {
         input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        },
        explanation: { 
            type: String,
            required: true
        }

    }
    ],
    startCode: [
        {
            language: {
                type: String,
                required: true
            },
            initialCode: {
                type: String,
                required: true 
            }
        }
    ],
    referenceSolution: [
        {
            language: {
                type: String,
                required: true
            },
            completeCode: {
                type: String,
                required: true 
            }
        }
    ],
    ProblemCreator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
   }

});
const Problem = monogoose.model('problem', problemSchema);
module.exports = Problem;

        