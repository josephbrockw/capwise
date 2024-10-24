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
            report_lines.append("Name,Weight,Views,Conversion Rate")
            stats = (
                variation.name,
                variation.weight,
                variation.views,
                (
                    f"{variation.conversions/variation.views:.2%}"
                    if variation.views > 0
                    else "0.00%"
                ),
            )
            report_lines.append(f"{stats[0]},{stats[1]},{stats[2]},{stats[3]}")

    return "\n".join(report_lines)
