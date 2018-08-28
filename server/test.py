"""
NOTE: This is for testing only, remove this later

@HealthSatisfactory
@HealthNotSatisfactory
@NotParticipatingHealthNutriActivities
@NotVarifiedHealthGrowthCard
@MUACSevereMalnutrition
@MUACPartiallyImmunized
@MUACModerateMalnutrition
@Textbox182

@PrimarySchoolAgeNoEducation
@PrimarySchoolAge
@PrimarySchoolAgeNonFormal
@PrimarySchoolAgeFormal

@SecondarySchoolAgeVocational
@SecondarySchoolAge
@SecondarySchoolAgeFormal
@SecondarySchoolAgeNonFormal
@SecondarySchoolAgeNoEducation

@NotSighted90Days
@NotSighted60Days
@NotSighted30Days
@VisitCompleted
@SponsorVisitCompleted


@Textbox217

TotalMale
@Textbox215
@SponsoredFemale
@Textbox4
@Textbox214
@PlannedRC
@Textbox206
@NotFollowingGrowthCurve
@Available
@Textbox29
@Textbox180
@TotalFemale
@Textbox24

@Textbox179
@Sponsored
@Textbox31
@Below5Child
@TotalDeath

@SponsoredMale
@Textbox41
@Textbox5
@Textbox213
@TotalRC
@AvailableMale
@TotalLeft
@Textbox55
@Textbox216
@Textbox181
@TotalHold
@AvailableFemale
@Textbox6
"""
from report.models import Report
from report.utils import extract_data
import json

data = Report.objects.first().data
print(json.dumps(extract_data(data)))
