import {
    isFalsy,
} from '@togglecorp/fujs';

// eslint-disable-next-line import/prefer-default-export
export const transformSoi = (soiData) => {
    if (isFalsy(soiData)) {
        return [];
    }

    const total = soiData.find(v => v.key === 'total_closed').value;
    const closed = soiData.find(v => v.key === 'closed_on').value;
    const percent = (closed / total) * 100;

    return ([
        ...soiData,
        {
            key: 'percent',
            value: percent || 0,
            label: 'SOI Rating',
        },
    ]);
};

export const transformMostVulnerableChildren = (data) => {
    if (isFalsy(data)) {
        return [];
    }
    const {
        totalMvcCount = 0,
        totalRcNotVcCount = 0,
        totalRcCount = 0,
    } = data;

    return [
        {
            label: 'Vulnerable Child (VC) Count',
            value: (totalRcCount - totalRcNotVcCount - totalMvcCount),
        },
        {
            label: 'Most Vulnerable Child (MVC) Count',
            value: totalMvcCount,
        },
        {
            label: 'Total RC Not VC Count',
            value: totalRcNotVcCount,
        },
        {
            label: 'Total RC Count',
            value: totalRcCount,
        },
    ];
};

export const transformMostVulnerableChildrenByMarker = (data) => {
    if (isFalsy(data)) {
        return [];
    }
    return [
        {
            type: 'Abusive Relationship',
            label: 'Child Labor',
            value: data.totalChildLabor,
        },
        {
            type: 'Abusive Relationship',
            label: 'Sexual Abuse',
            value: data.totalSexualAbuse,
        },
        {
            type: 'Abusive Relationship',
            label: 'Physical Abuse',
            value: data.totalPhysicalAbuse,
        },
        {
            type: 'Abusive Relationship',
            label: 'Child Trafficking',
            value: data.totalChildTrafficking,
        },
        {
            type: 'Abusive Relationship',
            label: 'Child Marriage',
            value: data.totalChildMarriage,
        },
        {
            type: 'Abusive Relationship',
            label: 'Early Sexual Debut / Child Pregnancy',
            value: data.totalEarlySexualDebut,
        },
        {
            type: 'Abusive Relationship',
            label: 'Substance Use',
            value: data.totalSubstanceUse,
        },
        {
            type: 'Abusive Relationship',
            label: 'Total Abusive Relationship',
            value: data.totalAbusiveExploitativeRelationships,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child Malnourished',
            value: data.totalChildMalnourished,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child in Household Below Poverty Threshold',
            value: data.totalChildInHouseholdBelowPovertyThreshold,
        },
        {
            type: 'Extreme Deprivation',
            label: 'No Access to Basic Services and Facilities',
            value: data.totalNoAccessToBasicServicesAndFacilities,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child is Orphan Abandoned Neglected',
            value: data.totalChildIsOrphanAbandonedNeglected,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child Not in School',
            value: data.totalChildNotInSchool,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child Living in Public Property Slums',
            value: data.totalChildLivingInPublicPropertySlums,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child Head of Household',
            value: data.totalChildHeadOfHousehold,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child Living or Working on the Street',
            value: data.totalChildLivingOrWorkingOnTheStreet,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child Caregiver',
            value: data.totalChildCaregiver,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Child living with step parents divorced parents single parent',
            value: data.totalChildLivingWithStepParentsDivorcedParentsSingleParent,
        },
        {
            type: 'Extreme Deprivation',
            label: 'Extreme Deprivation Total',
            value: data.totalExtremeDeprivation,
        },
        {
            type: 'Catastrophe/Disaster',
            label: 'Child Living in Disaster Prone Area',
            value: data.totalChildLivingInDisasterProneArea,
        },
        {
            type: 'Catastrophe/Disaster',
            label: 'Child Living in Areas With Conflict',
            value: data.totalChildLivingInAreasWithConflict,
        },
        {
            type: 'Catastrophe/Disaster',
            label: 'Child Living in Former War Zones',
            value: data.totalChildLivingInFormerWarZones,
        },
        {
            type: 'Catastrophe/Disaster',
            label: 'Child Affected by Epidemic',
            value: data.totalChildAffectedByEpidemic,
        },
        {
            type: 'Catastrophe/Disaster',
            label: 'Catastrophe/  Disaster Total',
            value: data.totalCatastropheDisaster,
        },
        {
            type: 'Serious Discrimination',
            label: 'Child with Disability',
            value: data.totalChildWithDisability,
        },
        {
            type: 'Serious Discrimination',
            label: 'Child Belongs to a Marginalized Group',
            value: data.totalChildBelongsToA_marginalizedGroup,
        },
        {
            type: 'Serious Discrimination',
            label: 'Child Refugee Children of Refugees Migrant',
            value: data.totalChildRefugeeChildrenOfRefugeesMigrant,
        },
        {
            type: 'Serious Discrimination',
            label: 'Child Delinquent',
            value: data.totalChildDelinquent,
        },
        {
            type: 'Serious Discrimination',
            label: 'Child Whose Parents are Imprisoned',
            value: data.totalChildWhoseParentsAreImprisoned,
        },
        {
            type: 'Serious Discrimination',
            label: 'Child Without Birth Registration',
            value: data.totalChildWithoutBirthRegistration,
        },
        {
            type: 'Serious Discrimination',
            label: 'Child Living in Isolation',
            value: data.totalChildLivingInIsolation,
        },
        {
            type: 'Serious Discrimination',
            label: 'Total Serious Discrimination',
            value: data.totalSeriousDiscimination,
        },
    ].filter(v => v.value);
};
