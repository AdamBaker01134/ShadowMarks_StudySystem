# 
#  _______  _______ _________          _______ 
# (  ____ \(  ____ \\__   __/|\     /|(  ____ )
# | (    \/| (    \/   ) (   | )   ( || (    )|
# | (_____ | (__       | |   | |   | || (____)|
# (_____  )|  __)      | |   | |   | ||  _____)
#       ) || (         | |   | |   | || (      
# /\____) || (____/\   | |   | (___) || )      
# \_______)(_______/   )_(   (_______)|/       
#                                              
#

# load packages
library(tidyverse)
library(ez)
library(ARTool)

new_theme <- theme_bw(base_size = 16) +
  theme(panel.grid.major = element_line(linewidth=.5, color="#e0e0e0"),
        axis.line = element_line(linewidth=.7, color="#e0e0e0"),
        panel.border = element_rect(fill=NA, color="#e0e0e0"),
        plot.margin=unit(c(2,2,2,2),"mm"))

# Resources:
# https://www.tidyverse.org/
# https://r-graphics.org/
# https://modernstatisticswithr.com/

DataFull <- read_csv("task1/shadowmarksTrialData_2024-08-15.csv", col_names=TRUE)
DataFull

DataFull <- DataFull %>% rename(technique = interaction)

DataFull$difference <- DataFull$difference1 * 446.67

DataFull$pID <- as_factor(DataFull$pID)
DataFull$technique <- as_factor(DataFull$technique)
DataFull$trial <- as_factor(DataFull$trial)
DataFull

DataFull <- DataFull %>% filter(trial!=0) %>% filter(task==1)
DataFull

# Filtering out incompletes
incompletes <- list(3,23,43,53,68)
DataFull <- DataFull %>% filter(!(pID %in% incompletes))
ezDesign(data=DataFull, x=technique, y=pID)
ezPrecis(DataFull)

Data <- DataFull %>% group_by(pID,technique,task,trial) %>% summarise(elapsedTime=max(elapsedTime)/1000, errors=max(attempt)-1)
Data

ctCap <- 180
accCap <- 12

# Filtering out outliers above elapsed time cap
nrow(Data)
Data <- Data %>% filter(elapsedTime < ctCap)
nrow(Data)
Data

# Filtering out outliers above accuracy cap
nrow(Data)
Data <- Data %>% filter(errors < accCap)
nrow(Data)
Data

complete_outliers <- list(2,7,31,32,47)

DataFull <- DataFull %>% filter(!(pID %in% complete_outliers))
Data <- Data %>% filter(!(pID %in% complete_outliers))
ezDesign(data=Data, x=technique, y=pID)
ezPrecis(Data)

# Total participants after cuts
length(unique(Data$pID))

#
#  _______  _        _______  _______  _______  _______  ______    __________________ _______  _______ 
# (  ____ \( \      (  ___  )(  ____ )(  ____ \(  ____ \(  __  \   \__   __/\__   __/(       )(  ____ \
# | (    \/| (      | (   ) || (    )|| (    \/| (    \/| (  \  )     ) (      ) (   | () () || (    \/
# | (__    | |      | (___) || (____)|| (_____ | (__    | |   ) |     | |      | |   | || || || (__    
# |  __)   | |      |  ___  ||  _____)(_____  )|  __)   | |   | |     | |      | |   | |(_)| ||  __)   
# | (      | |      | (   ) || (            ) || (      | |   ) |     | |      | |   | |   | || (      
# | (____/\| (____/\| )   ( || )      /\____) || (____/\| (__/  )     | |   ___) (___| )   ( || (____/\
# (_______/(_______/|/     \||/       \_______)(_______/(______/      )_(   \_______/|/     \|(_______/
#                                                                                                      
#

ctSummary <- Data %>%
  group_by(technique) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctSummary

ggplot(ctSummary, aes(x=technique, y=mean)) +
  geom_col(fill="lightblue", colour="#808080", width=0.5) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  scale_x_discrete(limits=c("smallMultiples","overlays","shadowMarkers"),
                   labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  xlab(label='Technique') +
  ylab(label='Completion Time (sec)')

ggsave("task1/ct-by-interaction-task1.png", width=10, height=10, units="cm", type="cairo-png")

ggplot(Data, aes(x=pID,y=elapsedTime, color=technique)) +
  geom_jitter(size=2.0) +
  scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
                     values=c("#FF3300","#0066CC","#00F000"),
                     labels=c("Small\nMultiples", "Overlays", "Shadow\nMarks")) +
  new_theme

ggsave("task1/ct-outliers.png", width=30, height=10, units="cm", type="cairo-png")

ctTrialSummary <- Data %>%
  group_by(technique,trial) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctTrialSummary

ggplot(ctTrialSummary, aes(x=trial, y=mean, group=technique)) +
  geom_line(aes(color=technique)) +
  geom_point(aes(color=technique))+
  # geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  xlab(label='Trial') +
  ylab(label='Completion Time (sec)') +
  scale_x_discrete(limits=c(1,2),
                   labels=c("1","2")) +
  scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
                     values=c("#FF3300","#0066CC","#00F000"),
                     labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  new_theme +
  theme(legend.position="right") +
  guides(fill=guide_legend(title=NULL))

ggsave("task1/ct-per-trial-task1.png", width=20, height=10, units="cm", type="cairo-png")

#
#  _______  _______  _______           _______  _______  _______          
# (  ___  )(  ____ \(  ____ \|\     /|(  ____ )(  ___  )(  ____ \|\     /|
# | (   ) || (    \/| (    \/| )   ( || (    )|| (   ) || (    \/( \   / )
# | (___) || |      | |      | |   | || (____)|| (___) || |       \ (_) / 
# |  ___  || |      | |      | |   | ||     __)|  ___  || |        \   /  
# | (   ) || |      | |      | |   | || (\ (   | (   ) || |         ) (   
# | )   ( || (____/\| (____/\| (___) || ) \ \__| )   ( || (____/\   | |   
# |/     \|(_______/(_______/(_______)|/   \__/|/     \|(_______/   \_/   
#                                                                         
#

accSummary <- Data %>%
  group_by(technique) %>%
  summarise(mean = mean(errors, na.rm = TRUE),
            sd = sd(errors, na.rm = TRUE),
            se = sd/sqrt(length(errors)))
accSummary

ggplot(accSummary, aes(x=technique, y=mean)) +
  geom_col(fill="lightblue", colour="#808080", width=0.5) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  scale_x_discrete(limits=c("smallMultiples","overlays","shadowMarkers"),
                   labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  xlab(label='Interaction') +
  ylab(label='Accuracy (number of errors)')

ggsave("task1/acc-by-interaction-task1.png", width=10, height=10, units="cm", type="cairo-png")

ggplot(Data, aes(x=pID,y=errors, color=technique)) +
  scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
                     values=c("#FF3300","#0066CC","#00F000"),
                     labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  geom_jitter(size=2.0) +
  new_theme

ggsave("task1/acc-outliers.png", width=30, height=10, units="cm", type="cairo-png")

accTrialSummary <- Data %>%
  group_by(technique,trial) %>%
  summarise(mean = mean(errors, na.rm = TRUE),
            sd = sd(errors, na.rm = TRUE),
            se = sd/sqrt(length(errors)))
accTrialSummary

ggplot(accTrialSummary, aes(x=trial, y=mean, group=technique)) +
  geom_line(aes(color=technique)) +
  geom_point(aes(color=technique))+
  # geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  xlab(label='Trial') +
  ylab(label='Accuracy (number of errors)') +
  scale_x_discrete(limits=c(1,2),
                   labels=c("1","2")) +
  scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
                     values=c("#FF3300","#0066CC","#00F000"),
                     labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  new_theme +
  theme(legend.position="right") +
  guides(fill=guide_legend(title=NULL))

ggsave("task1/acc-per-trial-task1.png", width=20, height=10, units="cm", type="cairo-png")

#
#  ______  _________ _______  _______  _______  _______  _______  _        _______  _______ 
# (  __  \ \__   __/(  ____ \(  ____ \(  ____ \(  ____ )(  ____ \( (    /|(  ____ \(  ____ \
# | (  \  )   ) (   | (    \/| (    \/| (    \/| (    )|| (    \/|  \  ( || (    \/| (    \/
# | |   ) |   | |   | (__    | (__    | (__    | (____)|| (__    |   \ | || |      | (__    
# | |   | |   | |   |  __)   |  __)   |  __)   |     __)|  __)   | (\ \) || |      |  __)   
# | |   ) |   | |   | (      | (      | (      | (\ (   | (      | | \   || |      | (      
# | (__/  )___) (___| )      | )      | (____/\| ) \ \__| (____/\| )  \  || (____/\| (____/\
# (______/ \_______/|/       |/       (_______/|/   \__/(_______/|/    )_)(_______/(_______/
#                                                                                           
#

DifferenceData <- DataFull %>% filter(attempt==1) %>%
  group_by(technique,trial) %>% 
  summarise(mean=mean(difference,na.rm=TRUE),
            sd=sd(difference,na.rm=TRUE),
            se=sd/sqrt(length(difference)))
DifferenceData

ggplot(DifferenceData, aes(x=trial, y=mean, group=technique)) +
  geom_line(aes(color=technique)) +
  geom_point(aes(color=technique))+
  # geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  xlab(label='Trial') +
  ylab(label='Distance to correct answer (pixels)') +
  scale_x_discrete(limits=c(1,2),
                   labels=c("1","2","3")) +
  scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
                     values=c("#FF3300","#0066CC","#00F000"),
                     labels=c("Small Multiples","Overlays","Shadow Marks")) +
  scale_y_discrete(limits=c("1","2","3","4")) +
  new_theme +
  theme(legend.position="right") +
  guides(fill=guide_legend(title=NULL))

ggsave("task1/error-distance-task1.png", width=20, height=10, units="cm", type="cairo-png")

# 
# _________ _                
# \__   __/( \      |\     /|
#    ) (   | (      ( \   / )
#    | |   | |       \ (_) / 
#    | |   | |        ) _ (  
#    | |   | |       / ( ) \ 
#    | |   | (____/\( /   \ )
#    )_(   (_______/|/     \|
#                            
#

tlxData <- read_csv("task1/shadowmarksTLXData_2024-08-15.csv", col_names=TRUE)
tlxData

tlxData <- tlxData %>% filter(!is.na(value)) %>% rename(technique = interaction)
tlxData

tlxData$pID <- as_factor(tlxData$pID)
tlxData$technique <- as_factor(tlxData$technique)

tlxData <- tlxData %>% filter(!(pID %in% incompletes)) %>%
  filter(!(pID %in% complete_outliers))

ezPrecis(tlxData)

ezDesign(data=tlxData, x=technique, y=pID)

tlxSummary <- tlxData %>% 
  group_by(technique,question) %>% 
  summarise(median = median(value, na.rm = TRUE) - 1,
            mean = mean(value, na.rm = TRUE) - 1,
            sd = sd(value, na.rm = TRUE),
            se = sd/sqrt(length(value)))
tlxSummary

ggplot(data=tlxSummary, aes(x=question, y=mean, fill=technique)) +
  geom_col(position=position_dodge(width=0.8), width=0.7) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se),width=0.2,
                position=position_dodge(width=0.8)) +
  xlab(label='NASA TLX Question') +
  ylab(label='Mean Score') +
  scale_y_continuous(limits=c(0, 6), breaks=c(0,2,4,6),
                     labels=c("1 (least)", "3", "5", "7 (most)")) +
  scale_x_discrete(limits=c("MentalDemand","PhysicalDemand","TemporalDemand",
                            "Performance","Effort","Frustration","Guessing",
                            "PerceivedAccuracy","TaskDifficulty",
                            "TechniqueDifficulty"),
                   labels=c("MentalDemand","PhysicalDemand","TemporalDemand",
                            "Performance","Effort","Frustration","Guessing",
                            "PerceivedAccuracy","TaskDifficulty",
                            "TechniqueDifficulty")) +
  scale_fill_manual(limits=c("smallmultiples", "overlays", "shadowmarkers"),
                    values=c("#FF3300","#0066CC","#00F000"),
                    labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  new_theme +
  theme(legend.position="bottom") +
  guides(fill=guide_legend(title=NULL))

ggsave("task1/tlx-1.png", width=50, height=10, units="cm", type="cairo-png")

# Anovas all at once
tlxNames <- c("MentalDemand", "PhysicalDemand", "TemporalDemand", "Performance", "Effort", "Frustration", "Guessing", "PerceivedAccuracy", "TaskDifficulty", "TechniqueDifficulty")
for (name in tlxNames) {
  cat("\n\n---------------------------------\n")
  cat(name)
  cat("\n---------------------------------\n\n")
  tlxSingle <- filter(tlxData, question==name)
  artResult <- art(value ~ technique + Error(pID), data=tlxSingle)
  print(summary(artResult))
  cat("\n----------\n")
  tlxAnova <- anova(artResult)
  print(tlxAnova)
  tlxFollowup <- art.con(artResult, "technique")
  print(tlxFollowup)
}

#
#  _______  _______  _______  _______  _______  _______  _______  _        _______  _______ 
# (  ____ )(  ____ )(  ____ \(  ____ \(  ____ \(  ____ )(  ____ \( (    /|(  ____ \(  ____ \
# | (    )|| (    )|| (    \/| (    \/| (    \/| (    )|| (    \/|  \  ( || (    \/| (    \/
# | (____)|| (____)|| (__    | (__    | (__    | (____)|| (__    |   \ | || |      | (__    
# |  _____)|     __)|  __)   |  __)   |  __)   |     __)|  __)   | (\ \) || |      |  __)   
# | (      | (\ (   | (      | (      | (      | (\ (   | (      | | \   || |      | (      
# | )      | ) \ \__| (____/\| )      | (____/\| ) \ \__| (____/\| )  \  || (____/\| (____/\
# |/       |/   \__/(_______/|/       (_______/|/   \__/(_______/|/    )_)(_______/(_______/
#                                                                                           
#

preferenceData <- read_csv("task1/shadowmarksPreferenceData_2024-08-15.csv", col_names=TRUE)
preferenceData

preferenceData <- preferenceData %>% filter(!is.na(answer))
preferenceData

preferenceData$pID <- as_factor(preferenceData$pID)
preferenceData$condition <- as_factor(preferenceData$condition)

preferenceData <- preferenceData %>% filter(!(pID %in% incompletes)) %>%
  filter(!(pID %in% complete_outliers))

ezPrecis(preferenceData)

ezDesign(data=preferenceData, x=answer, y=pID)

preferenceSummary <- preferenceData %>%
  group_by(question,answer) %>%
  summarise(n = n())
preferenceSummary

ggplot(data=preferenceSummary, aes(x=question, y=n, fill=answer)) +
  geom_col(position=position_dodge(width=0.8), width=0.7) +
  xlab(label='Preference Question') +
  ylab(label='Total Score') +
  scale_x_discrete(limits=c("accuracy","speed","preference"),
                   labels=c("Preferred Accuracy","Preferred Speed","Preferred Performance")) +
  scale_fill_manual(limits=c("Small Multiples", "Overlays", "Shadow Marks"),
                    values=c("#FF3300","#0066CC","#00F000"),
                    labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  new_theme +
  theme(legend.position="bottom") +
  guides(fill=guide_legend(title=NULL))

ggsave("task1/preference-1.png", width=18, height=10, units="cm", type="cairo-png")

test <- chisq.test(table(preferenceData$answer))
test

test$expected

table(preferenceData$answer)

#
#  ______   _______  _______  _______  _______  _______  _______  _______          _________ _______  _______ 
# (  __  \ (  ____ \(       )(  ___  )(  ____ \(  ____ )(  ___  )(  ____ )|\     /|\__   __/(  ____ \(  ____ \
# | (  \  )| (    \/| () () || (   ) || (    \/| (    )|| (   ) || (    )|| )   ( |   ) (   | (    \/| (    \/
# | |   ) || (__    | || || || |   | || |      | (____)|| (___) || (____)|| (___) |   | |   | |      | (_____ 
# | |   | ||  __)   | |(_)| || |   | || | ____ |     __)|  ___  ||  _____)|  ___  |   | |   | |      (_____  )
# | |   ) || (      | |   | || |   | || | \_  )| (\ (   | (   ) || (      | (   ) |   | |   | |            ) |
# | (__/  )| (____/\| )   ( || (___) || (___) || ) \ \__| )   ( || )      | )   ( |___) (___| (____/\/\____) |
# (______/ (_______/|/     \|(_______)(_______)|/   \__/|/     \||/       |/     \|\_______/(_______/\_______)
#                                                                                                             
#

demographicsData <- read_csv("task1/shadowmarksDemographicsData_2024-08-15.csv", col_names=TRUE)
demographicsData

demographicsData <- demographicsData %>% filter(!(pID %in% incompletes)) %>% filter(!(pID %in% complete_outliers))
demographicsData

mean(demographicsData$age)
nrow(demographicsData %>% filter(identify=="Man"))
nrow(demographicsData %>% filter(identify=="Woman"))
mean(demographicsData$ComputerExperience)
mean(demographicsData$GamesExperience)
mean(demographicsData$VideoEditingExperience)
mean(demographicsData$VideoComparisonExperience)
mean(demographicsData$VisualizationExperience)
mean(demographicsData$VisualizationComparisonExperience)

#
#  _______  _        _______           _______ 
# (  ___  )( (    /|(  ___  )|\     /|(  ___  )
# | (   ) ||  \  ( || (   ) || )   ( || (   ) |
# | (___) ||   \ | || |   | || |   | || (___) |
# |  ___  || (\ \) || |   | |( (   ) )|  ___  |
# | (   ) || | \   || |   | | \ \_/ / | (   ) |
# | )   ( || )  \  || (___) |  \   /  | )   ( |
# |/     \||/    )_)(_______)   \_/   |/     \|
#                                              
#

ct_anova <- ezANOVA(data=Data, dv=elapsedTime, wid=pID, within=.(technique),type=3, detailed=TRUE, return_aov=TRUE)
ct_anova

write.csv(ct_anova["ANOVA"], "task1/ct-anova-task1.csv", row.names=TRUE)

pairwise.t.test(Data$elapsedTime, Data$technique, p.adj = "holm")

acc_anova <- ezANOVA(data=Data, dv=errors, wid=pID, within=.(technique),type=3, detailed=TRUE, return_aov=TRUE)
acc_anova

write.csv(acc_anova["ANOVA"], "task1/acc-anova-task1.csv", row.names=TRUE)

pairwise.t.test(Data$errors, Data$technique, p.adj = "holm")

attempt1Data <- DataFull %>% filter(attempt==1)

errdist_anova <- ezANOVA(data=attempt1Data, dv=difference, wid=pID, within=.(technique), type=3, detailed=TRUE, return_aov=TRUE)
errdist_anova

write.csv(errdist_anova["ANOVA"], "task1/errdist-anova-task1.csv", row.names=TRUE)

pairwise.t.test(attempt1Data$difference, attempt1Data$technique, p.adj = "holm")
