import random
from scenarios import NormalUserScenario, BruteForceScenario


class ScenarioManager:
    def __init__(self, state, attack_probability=0.05):
        self.state = state
        self.attack_probability = attack_probability
        self.active_scenarios = []

    def start_scenario(self):
        if random.random() < self.attack_probability:
            scenario = BruteForceScenario(self.state)
        else:
            scenario = NormalUserScenario(self.state)

        scenario.start()
        self.active_scenarios.append(scenario)

    def next_event(self):
        if not self.active_scenarios:
            self.start_scenario()

        scenario = random.choice(self.active_scenarios)
        event = scenario.step()

        if scenario.is_finished():
            self.active_scenarios.remove(scenario)

        return event