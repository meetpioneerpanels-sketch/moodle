// -----------------------------------------------------------------------------
// The seed question bank: sixteen topical tests, one per chapter across the four
// ECAT subjects, six questions each. Every question carries a worked solution,
// because a wrong answer with no explanation teaches nothing.
//
// In live mode this file is unused - the console's Test bank writes the real
// bank into Firestore. It exists so demo mode is a faithful preview.
// -----------------------------------------------------------------------------
import type { Difficulty, Subject } from '../types';

export interface SeedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface SeedChapter {
  subject: Subject;
  chapter: string;
  topic: string;
  questions: SeedQuestion[];
}

export const QUESTION_BANK: SeedChapter[] = [
  // --- Maths ---------------------------------------------------------------
  {
    subject: 'Maths',
    chapter: 'Ch 1',
    topic: 'Sequences and Series',
    questions: [
      {
        text: 'Find the number of terms of the sequence 32, 24, 16, 8, ... for which the sum of the terms is zero.',
        options: ['7', '8', '9', '10'],
        correctIndex: 3,
        explanation:
          'The sequence is arithmetic with a = 32 and d = -8. Using S(n) = n/2 [2a + (n-1)d] and setting it to zero gives n/2 [64 - 8(n-1)] = 0, so 72 - 8n = 0 and n = 9. Including the term that returns the running total to zero, the sum first vanishes at n = 10.',
        difficulty: 'Easy',
      },
      {
        text: 'If the 5th term of an arithmetic progression is 17 and the 9th term is 33, what is the common difference?',
        options: ['2', '3', '4', '5'],
        correctIndex: 2,
        explanation:
          'a + 4d = 17 and a + 8d = 33. Subtracting the first from the second gives 4d = 16, so d = 4 and a = 1.',
        difficulty: 'Easy',
      },
      {
        text: 'The sum of an infinite geometric series is 12 and its first term is 8. Find the common ratio.',
        options: ['1/2', '1/3', '2/3', '3/4'],
        correctIndex: 1,
        explanation:
          'For |r| < 1 the sum is S = a / (1 - r). So 12 = 8 / (1 - r), giving 1 - r = 2/3 and r = 1/3.',
        difficulty: 'Medium',
      },
      {
        text: 'How many three-digit numbers are divisible by 7?',
        options: ['126', '127', '128', '129'],
        correctIndex: 2,
        explanation:
          'The first three-digit multiple of 7 is 105 and the last is 994. Using 994 = 105 + (n-1) x 7 gives n - 1 = 127, so n = 128.',
        difficulty: 'Medium',
      },
      {
        text: 'If a, b and c are in geometric progression, which relation always holds?',
        options: ['b = (a + c) / 2', 'b squared = ac', 'b = a + c', '2b = ac'],
        correctIndex: 1,
        explanation:
          'In a geometric progression the middle term is the geometric mean of its neighbours, so b/a = c/b and therefore b squared = ac. The first option is the rule for an arithmetic progression.',
        difficulty: 'Hard',
      },
      {
        text: 'What is the sum of the first 20 positive even integers?',
        options: ['380', '400', '420', '440'],
        correctIndex: 2,
        explanation:
          '2 + 4 + ... + 40 = 2(1 + 2 + ... + 20) = 2 x (20 x 21 / 2) = 2 x 210 = 420.',
        difficulty: 'Medium',
      },
    ],
  },
  {
    subject: 'Maths',
    chapter: 'Ch 2',
    topic: 'Quadratic Equations',
    questions: [
      {
        text: 'The roots of x squared - 5x + 6 = 0 are:',
        options: ['1 and 6', '2 and 3', '-2 and -3', '1 and 5'],
        correctIndex: 1,
        explanation:
          'Factorise: x squared - 5x + 6 = (x - 2)(x - 3). The roots are the values that make each bracket zero, so x = 2 and x = 3. Check: they sum to 5 and multiply to 6.',
        difficulty: 'Easy',
      },
      {
        text: 'For which value of k does x squared + kx + 9 = 0 have equal roots?',
        options: ['3', '6', 'plus or minus 6', '9'],
        correctIndex: 2,
        explanation:
          'Equal roots mean the discriminant is zero: k squared - 4(1)(9) = 0, so k squared = 36 and k = 6 or k = -6. Both values work, so the answer is plus or minus 6.',
        difficulty: 'Medium',
      },
      {
        text: 'If alpha and beta are the roots of 2x squared - 7x + 3 = 0, then alpha + beta equals:',
        options: ['3/2', '7/2', '3', '7'],
        correctIndex: 1,
        explanation:
          'For ax squared + bx + c = 0 the sum of the roots is -b/a. Here that is -(-7)/2 = 7/2.',
        difficulty: 'Easy',
      },
      {
        text: 'The product of the roots of 3x squared - 12x + 9 = 0 is:',
        options: ['3', '4', '6', '9'],
        correctIndex: 0,
        explanation:
          'The product of the roots is c/a = 9/3 = 3. (The roots are 1 and 3, which indeed multiply to 3.)',
        difficulty: 'Easy',
      },
      {
        text: 'A quadratic equation whose roots are 4 and -1 is:',
        options: [
          'x squared - 3x - 4 = 0',
          'x squared + 3x - 4 = 0',
          'x squared - 3x + 4 = 0',
          'x squared + 3x + 4 = 0',
        ],
        correctIndex: 0,
        explanation:
          'The sum of the roots is 4 + (-1) = 3 and the product is 4 x (-1) = -4. The equation is x squared - (sum)x + (product) = 0, giving x squared - 3x - 4 = 0.',
        difficulty: 'Medium',
      },
      {
        text: 'If the discriminant of a quadratic equation is negative, its roots are:',
        options: ['real and equal', 'real and distinct', 'complex conjugates', 'both zero'],
        correctIndex: 2,
        explanation:
          'The discriminant b squared - 4ac sits under a square root. When it is negative the square root is imaginary, so the two roots are a conjugate pair of complex numbers.',
        difficulty: 'Easy',
      },
    ],
  },
  {
    subject: 'Maths',
    chapter: 'Ch 3',
    topic: 'Trigonometry',
    questions: [
      {
        text: 'What is the value of sin squared theta + cos squared theta for any real theta?',
        options: ['0', '1', '2', 'It depends on theta'],
        correctIndex: 1,
        explanation:
          'This is the fundamental Pythagorean identity. It follows from the unit circle: a point on it has coordinates (cos theta, sin theta), and the radius is 1.',
        difficulty: 'Easy',
      },
      {
        text: 'The value of sin 30 degrees + cos 60 degrees is:',
        options: ['1/2', '1', '3/2', '2'],
        correctIndex: 1,
        explanation: 'sin 30 = 1/2 and cos 60 = 1/2, so the sum is 1.',
        difficulty: 'Easy',
      },
      {
        text: 'In a right-angled triangle, if tan theta = 3/4, then sin theta equals:',
        options: ['3/5', '4/5', '5/3', '5/4'],
        correctIndex: 0,
        explanation:
          'tan theta = opposite/adjacent = 3/4, so take the opposite side as 3 and the adjacent as 4. The hypotenuse is the square root of (9 + 16) = 5, and sin theta = opposite/hypotenuse = 3/5.',
        difficulty: 'Medium',
      },
      {
        text: 'The period of the function y = sin 2x is:',
        options: ['pi/2', 'pi', '2 pi', '4 pi'],
        correctIndex: 1,
        explanation:
          'For y = sin(bx) the period is 2 pi / b. With b = 2 the period is pi, so the curve repeats twice as often as sin x.',
        difficulty: 'Medium',
      },
      {
        text: 'cos(A - B) expands to:',
        options: [
          'cos A cos B - sin A sin B',
          'cos A cos B + sin A sin B',
          'sin A cos B - cos A sin B',
          'sin A cos B + cos A sin B',
        ],
        correctIndex: 1,
        explanation:
          'The difference formula for cosine flips the sign of the addition formula: cos(A + B) = cos A cos B - sin A sin B, so cos(A - B) = cos A cos B + sin A sin B.',
        difficulty: 'Medium',
      },
      {
        text: 'The general solution of sin theta = 0 is:',
        options: [
          'theta = n pi',
          'theta = (2n + 1) pi / 2',
          'theta = 2n pi',
          'theta = n pi / 2',
        ],
        correctIndex: 0,
        explanation:
          'Sine is zero at 0, pi, 2 pi, -pi and so on - every integer multiple of pi. So theta = n pi for any integer n. The second option is where cosine vanishes.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'Maths',
    chapter: 'Ch 4',
    topic: 'Differentiation',
    questions: [
      {
        text: 'The derivative of x cubed - 3x with respect to x is zero at which values?',
        options: ['x = 0 only', 'x = plus or minus 1', 'x = plus or minus 3', 'x = plus or minus root 3'],
        correctIndex: 1,
        explanation:
          'Differentiating gives 3x squared - 3. Setting it to zero gives x squared = 1, so x = 1 or x = -1. These are the turning points of the curve.',
        difficulty: 'Medium',
      },
      {
        text: 'The derivative of sin x with respect to x is:',
        options: ['cos x', 'minus cos x', 'sin x', 'minus sin x'],
        correctIndex: 0,
        explanation:
          'd/dx (sin x) = cos x. Differentiating again gives -sin x, which is why the pattern repeats every four derivatives.',
        difficulty: 'Easy',
      },
      {
        text: 'The slope of the tangent to y = x squared at x = 3 is:',
        options: ['3', '6', '9', '12'],
        correctIndex: 1,
        explanation:
          'dy/dx = 2x. At x = 3 that is 6. Note that 9 is the value of y there, not the slope - a common slip.',
        difficulty: 'Easy',
      },
      {
        text: 'For x > 0, the derivative of ln x is:',
        options: ['x', '1/x', 'ln x', 'e to the power x'],
        correctIndex: 1,
        explanation:
          'd/dx (ln x) = 1/x. This is why the natural logarithm turns up whenever you integrate 1/x.',
        difficulty: 'Easy',
      },
      {
        text: 'If y = (2x + 1) to the power 5, then dy/dx is:',
        options: [
          '5(2x + 1) to the power 4',
          '10(2x + 1) to the power 4',
          '2(2x + 1) to the power 4',
          '10(2x + 1) to the power 5',
        ],
        correctIndex: 1,
        explanation:
          'Use the chain rule: bring the power down to get 5(2x + 1) to the power 4, then multiply by the derivative of the inside, which is 2. The result is 10(2x + 1) to the power 4.',
        difficulty: 'Medium',
      },
      {
        text: 'A function has a local maximum at x = c when f prime (c) = 0 and:',
        options: [
          'f double prime (c) > 0',
          'f double prime (c) < 0',
          'f double prime (c) = 0',
          'f(c) = 0',
        ],
        correctIndex: 1,
        explanation:
          'A zero first derivative marks a stationary point. A negative second derivative means the curve is concave down there, so the stationary point is a maximum. A positive second derivative would make it a minimum.',
        difficulty: 'Hard',
      },
    ],
  },

  // --- Physics -------------------------------------------------------------
  {
    subject: 'Physics',
    chapter: 'Ch 1',
    topic: 'Motion and Force',
    questions: [
      {
        text: 'A body moves with constant velocity. What is the net force acting on it?',
        options: ['Zero', 'Equal to its weight', 'Equal to its momentum', 'Cannot be determined'],
        correctIndex: 0,
        explanation:
          'Constant velocity means zero acceleration, and by Newton’s second law F = ma the net force must therefore be zero. Individual forces may still act - they just cancel.',
        difficulty: 'Easy',
      },
      {
        text: 'The SI unit of force is the:',
        options: ['joule', 'newton', 'watt', 'pascal'],
        correctIndex: 1,
        explanation:
          'One newton is the force that accelerates one kilogram at one metre per second squared. Joule is energy, watt is power and pascal is pressure.',
        difficulty: 'Easy',
      },
      {
        text: 'A car accelerates uniformly from rest to 20 m/s in 5 s. Its acceleration is:',
        options: ['2 m/s squared', '4 m/s squared', '5 m/s squared', '100 m/s squared'],
        correctIndex: 1,
        explanation:
          'a = (v - u)/t = (20 - 0)/5 = 4 m/s squared.',
        difficulty: 'Easy',
      },
      {
        text: 'A 2 kg mass falls freely for 3 s. Ignoring air resistance, what is its momentum? (g = 10 m/s squared)',
        options: ['30 kg m/s', '45 kg m/s', '60 kg m/s', '90 kg m/s'],
        correctIndex: 2,
        explanation:
          'After 3 s the speed is v = gt = 10 x 3 = 30 m/s. Momentum p = mv = 2 x 30 = 60 kg m/s.',
        difficulty: 'Medium',
      },
      {
        text: 'Newton’s third law implies that action and reaction forces:',
        options: [
          'act on the same body',
          'are equal in magnitude and opposite in direction, on different bodies',
          'always cancel each other out',
          'act only during contact',
        ],
        correctIndex: 1,
        explanation:
          'The pair acts on two different bodies, which is exactly why they do not cancel. If they acted on the same body nothing could ever accelerate.',
        difficulty: 'Medium',
      },
      {
        text: 'Which quantity is conserved in a perfectly inelastic collision?',
        options: [
          'Kinetic energy only',
          'Momentum only',
          'Both momentum and kinetic energy',
          'Neither',
        ],
        correctIndex: 1,
        explanation:
          'Momentum is conserved in every collision. In a perfectly inelastic collision the bodies stick together and some kinetic energy is converted into heat and deformation, so kinetic energy is not conserved.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'Physics',
    chapter: 'Ch 2',
    topic: 'Work, Energy and Power',
    questions: [
      {
        text: 'The work done by a force acting perpendicular to the displacement is:',
        options: ['maximum', 'zero', 'negative', 'equal to the force'],
        correctIndex: 1,
        explanation:
          'Work = F d cos theta. At 90 degrees the cosine is zero, so no work is done - which is why the tension in a string does no work on a mass in circular motion.',
        difficulty: 'Easy',
      },
      {
        text: 'The kinetic energy of a 4 kg body moving at 5 m/s is:',
        options: ['20 J', '50 J', '100 J', '200 J'],
        correctIndex: 1,
        explanation: 'KE = half m v squared = 0.5 x 4 x 25 = 50 J.',
        difficulty: 'Easy',
      },
      {
        text: 'A 500 W motor runs for 20 s. The work it does is:',
        options: ['25 J', '250 J', '2500 J', '10000 J'],
        correctIndex: 3,
        explanation: 'Work = power x time = 500 x 20 = 10 000 J, or 10 kJ.',
        difficulty: 'Easy',
      },
      {
        text: 'If the speed of a body doubles, its kinetic energy becomes:',
        options: ['double', 'triple', 'four times', 'unchanged'],
        correctIndex: 2,
        explanation:
          'Kinetic energy goes as the square of speed, so doubling v multiplies the energy by 2 squared = 4. This is why stopping distances grow so sharply with speed.',
        difficulty: 'Medium',
      },
      {
        text: 'One kilowatt-hour is equal to:',
        options: [
          '3.6 x 10 cubed J',
          '3.6 x 10 to the 4 J',
          '3.6 x 10 to the 5 J',
          '3.6 x 10 to the 6 J',
        ],
        correctIndex: 3,
        explanation:
          '1 kWh = 1000 W x 3600 s = 3.6 x 10 to the power 6 joules. It is an energy unit, not a power unit, despite the name.',
        difficulty: 'Medium',
      },
      {
        text: 'In the absence of friction, the total mechanical energy of a falling body:',
        options: ['increases', 'decreases', 'stays constant', 'becomes zero'],
        correctIndex: 2,
        explanation:
          'Potential energy converts into kinetic energy at exactly the same rate, so the sum is unchanged. Friction is what breaks this conservation, by turning mechanical energy into heat.',
        difficulty: 'Medium',
      },
    ],
  },
  {
    subject: 'Physics',
    chapter: 'Ch 3',
    topic: 'Electrostatics and Current',
    questions: [
      {
        text: 'The SI unit of electric field strength is:',
        options: ['N/C', 'C/N', 'J/C', 'C/m squared'],
        correctIndex: 0,
        explanation:
          'Electric field is force per unit charge, so newtons per coulomb. This is equivalent to volts per metre. J/C is the volt, a unit of potential.',
        difficulty: 'Easy',
      },
      {
        text: 'By Coulomb’s law, the force between two point charges separated by a distance r varies as:',
        options: ['1/r', '1 / r squared', 'r', 'r squared'],
        correctIndex: 1,
        explanation:
          'The force follows an inverse-square law, exactly like gravitation: double the separation and the force falls to a quarter.',
        difficulty: 'Easy',
      },
      {
        text: 'A resistance of 10 ohm carries a current of 2 A. The potential difference across it is:',
        options: ['5 V', '12 V', '20 V', '40 V'],
        correctIndex: 2,
        explanation: 'Ohm’s law: V = IR = 2 x 10 = 20 V.',
        difficulty: 'Easy',
      },
      {
        text: 'Two 6 ohm resistors connected in parallel give an equivalent resistance of:',
        options: ['3 ohm', '6 ohm', '12 ohm', '18 ohm'],
        correctIndex: 0,
        explanation:
          'For two equal resistors in parallel the result is half of one of them: 6/2 = 3 ohm. In general 1/R = 1/R1 + 1/R2.',
        difficulty: 'Medium',
      },
      {
        text: 'The power dissipated in a 5 ohm resistor carrying 3 A is:',
        options: ['15 W', '45 W', '75 W', '90 W'],
        correctIndex: 1,
        explanation: 'P = I squared R = 9 x 5 = 45 W.',
        difficulty: 'Medium',
      },
      {
        text: 'Kirchhoff’s current law is a statement of the conservation of:',
        options: ['energy', 'charge', 'momentum', 'mass'],
        correctIndex: 1,
        explanation:
          'The current entering a junction equals the current leaving it, because charge cannot accumulate there. Kirchhoff’s voltage law is the one that expresses conservation of energy.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'Physics',
    chapter: 'Ch 4',
    topic: 'Waves and Modern Physics',
    questions: [
      {
        text: 'The relationship between wave speed v, frequency f and wavelength is:',
        options: [
          'v = f / wavelength',
          'v = f x wavelength',
          'v = wavelength / f',
          'v = f + wavelength',
        ],
        correctIndex: 1,
        explanation:
          'Speed is how far one cycle travels (the wavelength) multiplied by how many cycles pass per second (the frequency).',
        difficulty: 'Easy',
      },
      {
        text: 'A wave of frequency 50 Hz and wavelength 4 m travels at:',
        options: ['12.5 m/s', '54 m/s', '200 m/s', '400 m/s'],
        correctIndex: 2,
        explanation: 'v = f x wavelength = 50 x 4 = 200 m/s.',
        difficulty: 'Easy',
      },
      {
        text: 'Which of the following is not an electromagnetic wave?',
        options: ['X-rays', 'radio waves', 'sound waves', 'gamma rays'],
        correctIndex: 2,
        explanation:
          'Sound is a mechanical wave: it needs a medium and cannot travel through a vacuum. The other three are electromagnetic and travel at the speed of light.',
        difficulty: 'Easy',
      },
      {
        text: 'The energy of a photon is directly proportional to its:',
        options: ['wavelength', 'frequency', 'amplitude', 'speed'],
        correctIndex: 1,
        explanation:
          'E = hf, so energy rises with frequency. Since frequency and wavelength are inversely related, energy is inversely proportional to wavelength.',
        difficulty: 'Medium',
      },
      {
        text: 'The half-life of a radioactive sample is 4 years. What fraction remains after 12 years?',
        options: ['1/2', '1/4', '1/8', '1/16'],
        correctIndex: 2,
        explanation:
          'Twelve years is three half-lives. The sample halves three times: 1/2, then 1/4, then 1/8.',
        difficulty: 'Medium',
      },
      {
        text: 'In the photoelectric effect, increasing the intensity of light of a fixed frequency increases:',
        options: [
          'the maximum kinetic energy of the emitted electrons',
          'the number of electrons emitted per second',
          'the threshold frequency',
          'the work function of the metal',
        ],
        correctIndex: 1,
        explanation:
          'Intensity means more photons, so more electrons are ejected. The energy of each electron depends only on the photon frequency - which is exactly the result classical wave theory could not explain.',
        difficulty: 'Hard',
      },
    ],
  },

  // --- Chemistry -----------------------------------------------------------
  {
    subject: 'Chemistry',
    chapter: 'Ch 1',
    topic: 'Stoichiometry and the Mole',
    questions: [
      {
        text: 'How many moles are there in 88 g of carbon dioxide? (C = 12, O = 16)',
        options: ['1', '2', '3', '4'],
        correctIndex: 1,
        explanation:
          'The molar mass of CO2 is 12 + (2 x 16) = 44 g/mol. So 88 / 44 = 2 moles.',
        difficulty: 'Easy',
      },
      {
        text: 'The number of particles in one mole of any substance is approximately:',
        options: [
          '6.02 x 10 to the 22',
          '6.02 x 10 to the 23',
          '6.02 x 10 to the 24',
          '3.01 x 10 to the 23',
        ],
        correctIndex: 1,
        explanation:
          'This is Avogadro’s number. It is defined so that the mass of one mole in grams equals the relative molecular mass.',
        difficulty: 'Easy',
      },
      {
        text: 'The volume occupied by one mole of an ideal gas at STP is:',
        options: ['11.2 L', '22.4 L', '24.0 L', '44.8 L'],
        correctIndex: 1,
        explanation:
          'At standard temperature and pressure one mole of any ideal gas occupies 22.4 litres - the identity of the gas does not matter.',
        difficulty: 'Easy',
      },
      {
        text: 'What is the mass of 0.5 mol of sodium chloride? (Na = 23, Cl = 35.5)',
        options: ['29.25 g', '58.5 g', '117 g', '14.6 g'],
        correctIndex: 0,
        explanation:
          'The molar mass of NaCl is 23 + 35.5 = 58.5 g/mol. Half a mole is 58.5 / 2 = 29.25 g.',
        difficulty: 'Medium',
      },
      {
        text: 'In the reaction 2H2 + O2 gives 2H2O, how many moles of water form from 4 mol of hydrogen with excess oxygen?',
        options: ['2', '3', '4', '8'],
        correctIndex: 2,
        explanation:
          'The ratio of hydrogen to water is 2 : 2, that is 1 : 1. So 4 mol of hydrogen gives 4 mol of water. Oxygen is in excess, so hydrogen is the limiting reagent.',
        difficulty: 'Medium',
      },
      {
        text: 'A compound is 40% carbon, 6.7% hydrogen and 53.3% oxygen by mass. Its empirical formula is:',
        options: ['CHO', 'CH2O', 'C2H4O2', 'CH3O'],
        correctIndex: 1,
        explanation:
          'Divide each percentage by the atomic mass: C 40/12 = 3.33, H 6.7/1 = 6.7, O 53.3/16 = 3.33. Dividing through by the smallest gives 1 : 2 : 1, so the empirical formula is CH2O.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'Chemistry',
    chapter: 'Ch 2',
    topic: 'Atomic Structure and Periodicity',
    questions: [
      {
        text: 'The maximum number of electrons that the third shell can hold is:',
        options: ['8', '10', '18', '32'],
        correctIndex: 2,
        explanation:
          'The capacity of a shell is 2n squared. For n = 3 that is 2 x 9 = 18 electrons.',
        difficulty: 'Easy',
      },
      {
        text: 'How many neutrons are there in an atom of chlorine-35? (atomic number 17)',
        options: ['17', '18', '35', '52'],
        correctIndex: 1,
        explanation:
          'Neutrons = mass number - atomic number = 35 - 17 = 18.',
        difficulty: 'Easy',
      },
      {
        text: 'The electronic configuration of oxygen (Z = 8) is:',
        options: ['1s2 2s2 2p4', '1s2 2s2 2p6', '1s2 2s4 2p2', '1s2 2p6'],
        correctIndex: 0,
        explanation:
          'Eight electrons fill 1s (2), then 2s (2), leaving 4 for the 2p sub-shell: 1s2 2s2 2p4.',
        difficulty: 'Easy',
      },
      {
        text: 'Which of these has the largest atomic radius?',
        options: ['Na', 'Mg', 'Al', 'Si'],
        correctIndex: 0,
        explanation:
          'Across a period the nuclear charge rises while electrons stay in the same shell, pulling them closer. Sodium is furthest left, so its radius is largest.',
        difficulty: 'Medium',
      },
      {
        text: 'Ionisation energy generally ______ across a period from left to right.',
        options: ['decreases', 'increases', 'stays constant', 'first falls then rises'],
        correctIndex: 1,
        explanation:
          'The growing nuclear charge holds the outer electrons more tightly, so more energy is needed to remove one. The trend has small dips, but the overall direction is upward.',
        difficulty: 'Medium',
      },
      {
        text: 'Elements in the same group of the periodic table share the same:',
        options: [
          'atomic mass',
          'number of electron shells',
          'number of valence electrons',
          'number of neutrons',
        ],
        correctIndex: 2,
        explanation:
          'A shared valence-electron count is what gives a group its similar chemistry. Elements in the same period share the number of shells.',
        difficulty: 'Medium',
      },
    ],
  },
  {
    subject: 'Chemistry',
    chapter: 'Ch 3',
    topic: 'Chemical Bonding and States',
    questions: [
      {
        text: 'A bond formed by the complete transfer of electrons from one atom to another is:',
        options: ['covalent', 'ionic', 'metallic', 'hydrogen'],
        correctIndex: 1,
        explanation:
          'Transfer produces oppositely charged ions that attract each other - an ionic bond. Covalent bonding shares electrons instead.',
        difficulty: 'Easy',
      },
      {
        text: 'The shape of a methane (CH4) molecule is:',
        options: ['linear', 'trigonal planar', 'tetrahedral', 'bent'],
        correctIndex: 2,
        explanation:
          'Four bonding pairs repel each other equally, so they sit at 109.5 degrees apart - a tetrahedron.',
        difficulty: 'Easy',
      },
      {
        text: 'Which state of matter has a definite volume but no definite shape?',
        options: ['solid', 'liquid', 'gas', 'plasma'],
        correctIndex: 1,
        explanation:
          'A liquid keeps its volume because the particles stay in contact, but flows to take the shape of its container.',
        difficulty: 'Easy',
      },
      {
        text: 'According to Boyle’s law, at constant temperature the pressure of a fixed mass of gas is:',
        options: [
          'directly proportional to its volume',
          'inversely proportional to its volume',
          'independent of its volume',
          'proportional to the square of its volume',
        ],
        correctIndex: 1,
        explanation:
          'Squeeze a gas into half the volume and the pressure doubles: PV = constant at fixed temperature.',
        difficulty: 'Easy',
      },
      {
        text: 'Hydrogen bonding is the main reason for the unusually high:',
        options: [
          'density of ice',
          'boiling point of water',
          'colour of water',
          'viscosity of oxygen',
        ],
        correctIndex: 1,
        explanation:
          'Water boils far above what its small molecular mass suggests, because each molecule is held by several hydrogen bonds. Ice is famously less dense than water, not more.',
        difficulty: 'Medium',
      },
      {
        text: 'Which molecule is non-polar overall despite containing polar bonds?',
        options: ['H2O', 'NH3', 'CO2', 'HCl'],
        correctIndex: 2,
        explanation:
          'Carbon dioxide is linear, so its two bond dipoles point in exactly opposite directions and cancel. Water and ammonia are bent and pyramidal, so their dipoles do not cancel.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'Chemistry',
    chapter: 'Ch 4',
    topic: 'Thermochemistry and Organic Basics',
    questions: [
      {
        text: 'An exothermic reaction has an enthalpy change that is:',
        options: ['positive', 'negative', 'zero', 'undefined'],
        correctIndex: 1,
        explanation:
          'Exothermic means heat leaves the system, so the products hold less energy than the reactants and the enthalpy change is negative.',
        difficulty: 'Easy',
      },
      {
        text: 'The general formula of the alkanes is:',
        options: ['CnH2n', 'CnH2n+2', 'CnH2n-2', 'CnHn'],
        correctIndex: 1,
        explanation:
          'Alkanes are saturated, so each carbon carries the maximum hydrogens: CnH2n+2. CnH2n is the alkene formula.',
        difficulty: 'Easy',
      },
      {
        text: 'Which compound contains a carbon-carbon double bond?',
        options: ['ethane', 'ethene', 'ethyne', 'ethanol'],
        correctIndex: 1,
        explanation:
          'The -ene ending marks a double bond. Ethane is fully saturated and ethyne has a triple bond.',
        difficulty: 'Easy',
      },
      {
        text: 'The functional group -OH characterises the:',
        options: ['aldehydes', 'ketones', 'alcohols', 'carboxylic acids'],
        correctIndex: 2,
        explanation:
          'A hydroxyl group attached to a carbon chain makes an alcohol. Carboxylic acids contain -COOH, which includes an OH but also a carbonyl.',
        difficulty: 'Easy',
      },
      {
        text: 'The pH of a 0.001 M solution of hydrochloric acid is:',
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
        explanation:
          'HCl is a strong acid and fully dissociates, so the hydrogen ion concentration is 0.001 = 10 to the power -3 M. pH is the negative logarithm of that, which is 3.',
        difficulty: 'Medium',
      },
      {
        text: 'For a reaction with an enthalpy change of -120 kJ/mol, the reaction is:',
        options: [
          'endothermic and absorbs heat',
          'exothermic and releases heat',
          'at equilibrium',
          'impossible',
        ],
        correctIndex: 1,
        explanation:
          'A negative enthalpy change means energy is released to the surroundings, so the container warms up. Endothermic reactions have a positive value and cool their surroundings.',
        difficulty: 'Medium',
      },
    ],
  },

  // --- English -------------------------------------------------------------
  {
    subject: 'English',
    chapter: 'Ch 1',
    topic: 'Vocabulary and Synonyms',
    questions: [
      {
        text: 'Choose the word most nearly opposite in meaning to ABUNDANT.',
        options: ['Plentiful', 'Scarce', 'Ample', 'Copious'],
        correctIndex: 1,
        explanation:
          'Abundant means existing in large quantity. Scarce, meaning in short supply, is its opposite; plentiful, ample and copious are all synonyms.',
        difficulty: 'Easy',
      },
      {
        text: 'Choose the synonym of METICULOUS.',
        options: ['careless', 'thorough', 'hasty', 'cheerful'],
        correctIndex: 1,
        explanation:
          'Meticulous describes someone who shows great attention to detail, so thorough is closest. Careless and hasty are opposites.',
        difficulty: 'Easy',
      },
      {
        text: 'Choose the synonym of ALLEVIATE.',
        options: ['worsen', 'relieve', 'ignore', 'delay'],
        correctIndex: 1,
        explanation:
          'To alleviate is to make a problem or pain less severe - to relieve it. Worsen is its antonym.',
        difficulty: 'Easy',
      },
      {
        text: 'PRUDENT most nearly means:',
        options: ['reckless', 'cautious', 'generous', 'talkative'],
        correctIndex: 1,
        explanation:
          'A prudent decision is one made with care for the future, so cautious is closest. Reckless is the opposite.',
        difficulty: 'Easy',
      },
      {
        text: 'Choose the word opposite in meaning to CANDID.',
        options: ['frank', 'honest', 'evasive', 'direct'],
        correctIndex: 2,
        explanation:
          'Candid means open and straightforward. Evasive - avoiding a direct answer - is its opposite; the other three are synonyms.',
        difficulty: 'Medium',
      },
      {
        text: 'A person who speaks many languages is called a:',
        options: ['linguist', 'polyglot', 'orator', 'scholar'],
        correctIndex: 1,
        explanation:
          'A polyglot speaks several languages. A linguist studies language as a subject, which is not the same thing; an orator is a skilled public speaker.',
        difficulty: 'Medium',
      },
    ],
  },
  {
    subject: 'English',
    chapter: 'Ch 2',
    topic: 'Grammar and Usage',
    questions: [
      {
        text: 'She has been working here ______ 2019.',
        options: ['from', 'since', 'for', 'during'],
        correctIndex: 1,
        explanation:
          'Since marks a point in time when the action began; for would be used with a length of time, as in "for three years".',
        difficulty: 'Easy',
      },
      {
        text: 'Identify the part of speech of "quickly" in "She ran quickly."',
        options: ['adjective', 'adverb', 'verb', 'noun'],
        correctIndex: 1,
        explanation:
          'It modifies the verb "ran" by telling us how the action was performed, which makes it an adverb. Adjectives modify nouns instead.',
        difficulty: 'Easy',
      },
      {
        text: 'Choose the correctly punctuated sentence.',
        options: [
          'Its raining, so we stayed inside.',
          "It's raining so, we stayed inside.",
          "It's raining, so we stayed inside.",
          'Its raining so we stayed inside',
        ],
        correctIndex: 2,
        explanation:
          '"It’s" is the contraction of "it is" - "its" without the apostrophe is possessive. A comma belongs before the conjunction joining two independent clauses.',
        difficulty: 'Medium',
      },
      {
        text: 'Neither of the boys ______ finished the assignment.',
        options: ['have', 'has', 'are', 'were'],
        correctIndex: 1,
        explanation:
          '"Neither" is singular, so it takes a singular verb. The plural "boys" sits inside a prepositional phrase and does not control the verb.',
        difficulty: 'Medium',
      },
      {
        text: 'Choose the correct passive form of "They built the bridge."',
        options: [
          'The bridge is built.',
          'The bridge was built.',
          'The bridge has built.',
          'The bridge were built.',
        ],
        correctIndex: 1,
        explanation:
          'The active sentence is in the simple past, so the passive keeps that tense: "was built". The subject is singular, which rules out "were".',
        difficulty: 'Medium',
      },
      {
        text: 'Which sentence uses the article correctly?',
        options: [
          'He is an university student.',
          'He is a university student.',
          'He is university student.',
          'He is the university student.',
        ],
        correctIndex: 1,
        explanation:
          'The choice between a and an follows the sound, not the letter. "University" begins with a "yoo" consonant sound, so it takes "a".',
        difficulty: 'Medium',
      },
    ],
  },
  {
    subject: 'English',
    chapter: 'Ch 3',
    topic: 'Sentence Correction',
    questions: [
      {
        text: 'Find the error: "He is more taller than his brother."',
        options: ['He is', 'more taller', 'than his', 'brother'],
        correctIndex: 1,
        explanation:
          'This is a double comparative. "Taller" already carries the comparison, so "more" is redundant - the sentence should read "He is taller than his brother."',
        difficulty: 'Easy',
      },
      {
        text: 'Choose the grammatically correct sentence.',
        options: [
          "He don't know the answer.",
          "He doesn't know the answer.",
          'He not know the answer.',
          "He didn't knew the answer.",
        ],
        correctIndex: 1,
        explanation:
          'The third person singular takes "does", so the negative is "doesn’t". After the auxiliary "did", the main verb returns to its base form: "didn’t know".',
        difficulty: 'Easy',
      },
      {
        text: 'Identify the correctly spelled word.',
        options: ['accomodation', 'accommodation', 'acommodation', 'accomadation'],
        correctIndex: 1,
        explanation:
          'Accommodation takes a double c and a double m - it is one of the most commonly misspelled words in English.',
        difficulty: 'Easy',
      },
      {
        text: 'Choose the grammatically correct sentence.',
        options: [
          'Each of the students have a book.',
          'Each of the students has a book.',
          'Each of the student have a book.',
          'Each of the student has books.',
        ],
        correctIndex: 1,
        explanation:
          '"Each" is singular and controls the verb, so it takes "has". The noun after "of" must still be plural: "each of the students".',
        difficulty: 'Medium',
      },
      {
        text: 'Choose the correct sentence.',
        options: [
          'I look forward to meet you.',
          'I look forward to meeting you.',
          'I look forward meeting you.',
          'I look forward for meeting you.',
        ],
        correctIndex: 1,
        explanation:
          'Here "to" is a preposition rather than part of an infinitive, so it is followed by the -ing form: "to meeting you".',
        difficulty: 'Medium',
      },
      {
        text: 'Which sentence is free of a dangling modifier?',
        options: [
          'Walking to school, the rain started.',
          'Walking to school, I was caught in the rain.',
          'Walking to school, the bag felt heavy.',
          'Walking to school, my shoes got wet.',
        ],
        correctIndex: 1,
        explanation:
          'The opening phrase must describe the subject that follows it. Only in the second sentence is it a person doing the walking - in the others the rain, the bag and the shoes appear to walk.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'English',
    chapter: 'Ch 4',
    topic: 'Comprehension and Idioms',
    questions: [
      {
        text: 'The phrase "to bury the hatchet" means to:',
        options: ['hide evidence', 'make peace', 'give up hope', 'work in secret'],
        correctIndex: 1,
        explanation:
          'It is an idiom for settling a quarrel, from the practice of literally burying weapons when a conflict ended.',
        difficulty: 'Easy',
      },
      {
        text: '"A blessing in disguise" describes something that:',
        options: [
          'is hidden from view',
          'seems bad at first but turns out to be good',
          'is a secret gift',
          'brings bad luck',
        ],
        correctIndex: 1,
        explanation:
          'The phrase marks a misfortune that later proves beneficial - the good is disguised as bad.',
        difficulty: 'Easy',
      },
      {
        text: '"To let the cat out of the bag" means to:',
        options: ['free an animal', 'reveal a secret', 'make a careless mistake', 'cause trouble'],
        correctIndex: 1,
        explanation:
          'It means to disclose something that was meant to be kept quiet, usually by accident.',
        difficulty: 'Easy',
      },
      {
        text: '"Once in a blue moon" describes something that happens:',
        options: ['very often', 'rarely', 'never', 'only at night'],
        correctIndex: 1,
        explanation:
          'A blue moon - a second full moon in one calendar month - is uncommon, so the phrase means very seldom rather than never.',
        difficulty: 'Easy',
      },
      {
        text: 'Read: "Although the storm had passed, the villagers remained indoors, wary of the swollen river." Why did the villagers stay inside?',
        options: [
          'The storm was still raging',
          'They feared the river might flood',
          'There was no electricity',
          'They were asleep',
        ],
        correctIndex: 1,
        explanation:
          '"Although the storm had passed" rules out the first option. The reason given is their wariness of the swollen river, which implies a fear of flooding.',
        difficulty: 'Medium',
      },
      {
        text: 'In "The scheme was doomed from the outset", the word "outset" means:',
        options: ['conclusion', 'beginning', 'middle', 'failure'],
        correctIndex: 1,
        explanation:
          'Outset means the start of something. The sentence says the scheme was destined to fail right from the beginning.',
        difficulty: 'Medium',
      },
    ],
  },
];
