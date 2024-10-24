from experiment.models import Experiment


def generate_active_experiments_report():
    active_experiments = Experiment.objects.filter(is_active=True)

    if not active_experiments.exists():
        return "No active experiments found."

    report_lines = ["Active Experiments Report:"]
    for experiment in active_experiments:
        report_lines.append(f"\nExperiment: {experiment.name}")
        report_lines.append(f"Description: {experiment.description}")
        report_lines.append(f"Created at: {experiment.created_at}")
        report_lines.append("Variations:")

        for variation in experiment.variations.all():
            report_lines.append(f"  - {variation.name}")
            report_lines.append(f"    Weight:          {variation.weight}")
            report_lines.append(f"    Seen Count:      {variation.seen_count}")
            report_lines.append(
                "    Conversion Rate: "
                f"{variation.conversion_count / variation.seen_count:.2%}"
                if variation.seen_count > 0
                else "    Conversion Rate: 0.00%"
            )

    return "\n".join(report_lines)
