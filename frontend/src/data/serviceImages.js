import imgFlightDispatch from '@/assets/services/01_flight_dispatch.webp'
import imgDgr from '@/assets/services/02_dangerous_goods.webp'
import imgTrainTrainer from '@/assets/services/03_train_trainer.webp'
import imgHumanFactors from '@/assets/services/04_human_factors.webp'
import imgCrewControl from '@/assets/services/05_crew_control.webp'
import imgConsulting from '@/assets/services/06_consulting.webp'

// The photo each course uses on the Services page, by course slug - so the
// admin shows the same picture the public site does.
export const SERVICE_IMAGE_BY_SLUG = {
  'flight-dispatcher-initial-certification': imgFlightDispatch,
  'aircraft-dispatcher-training-faa-part-65': imgFlightDispatch,
  'flight-dispatcher-double-programme': '/course-images/Flight-Dispatch-Webpage-Small.jpg',
  'dangerous-goods-regulations-cbta-initial': imgDgr,
  'train-the-trainer-icao-cbta-instructor': imgTrainTrainer,
  'human-factors-in-the-occ': imgHumanFactors,
  'airline-crew-control-flight-rostering': imgCrewControl,
  'airline-occ-setup-operational-consulting': imgConsulting
}
