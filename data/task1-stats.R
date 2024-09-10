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
library(ggsignif)

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
DataFull$technique <- factor(DataFull$technique, levels=c("smallMultiples","overlays", "shadowMarkers"))
DataFull$trial <- as_factor(DataFull$trial)
DataFull

DataFull <- DataFull %>% filter(trial!=0) %>% filter(task==1)
DataFull

# Filtering out incompletes and outliers above 180s elapsed time cap
incompletes <- list(3,23,43,53,68)
DataFull <- DataFull %>% filter(!(pID %in% incompletes))

# Counting number of trials capped
DataTooLong <- DataFull %>% filter(elapsedTime >= 180000) %>% group_by(pID,technique,task,trial) %>% summarise(elapsedTime=max(elapsedTime)/1000, errors=max(attempt)-1)
DataTooLong

# Counting number of trials removed
DataTooLongRemove <- DataFull %>% filter(elapsedTime >= 180000) %>% group_by(pID,technique,task,trial,attempt) %>% summarise(elapsedTime=max(elapsedTime)/1000, errors=max(attempt)-1) %>% filter(attempt==1)
DataTooLongRemove

DataTooManyErrors <- DataFull %>% group_by(pID,technique,task,trial) %>% summarise(elapsedTime=max(elapsedTime)/1000, errors=max(attempt)-1) %>% filter(errors >= 12)
DataTooManyErrors

DataFull <- DataFull %>% filter(elapsedTime < 180000)
ezDesign(data=DataFull, x=technique, y=pID)
ezPrecis(DataFull)

Data <- DataFull %>% group_by(pID,technique,task,trial) %>% summarise(elapsedTime=max(elapsedTime)/1000, errors=max(attempt)-1)
Data

accCap <- 12

# Filtering out outliers above accuracy cap
nrow(Data)
Data <- Data %>% filter(errors < accCap)
nrow(Data)
Data

complete_outliers <- list(32)

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

ctAnnotation <- data.frame(
  start=1,
  end=3,
  y=110,
  label="Something"
)

ggplot(ctSummary, aes(x=technique, y=mean)) +
  geom_col(fill=c("#FF3300","#0066CC","#00F000"), color="black", width=0.5) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  geom_label(aes(label = paste(round(mean,digits=2))), nudge_y = 10, size = 4,
             label.size = 0, label.r = unit(0, "pt")) +
  new_theme +
  scale_x_discrete(limits=c("smallMultiples","overlays","shadowMarkers"),
                   labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  xlab(label='Technique') +
  ylab(label='Mean Completion Time (sec)')

ggsave("task1/ct-by-technique-task1.png", width=10, height=10, units="cm", type="cairo-png")

# ggplot(Data, aes(x=pID,y=elapsedTime, color=technique)) +
#   geom_jitter(size=2.0) +
#   scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
#                      values=c("#FF3300","#0066CC","#00F000"),
#                      labels=c("Small\nMultiples", "Overlays", "Shadow\nMarks")) +
#   new_theme
# 
# ggsave("task1/ct-outliers.png", width=30, height=10, units="cm", type="cairo-png")

# ctTrialSummary <- Data %>%
#   group_by(technique,trial) %>%
#   summarise(mean = mean(elapsedTime, na.rm = TRUE),
#             sd = sd(elapsedTime, na.rm = TRUE),
#             se = sd/sqrt(length(elapsedTime)))
# ctTrialSummary

# ggplot(ctTrialSummary, aes(x=trial, y=mean, group=technique)) +
#   geom_line(aes(color=technique),size=1.5) +
#   geom_point(aes(color=technique),size=2)+
#   # geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
#   xlab(label='Trial') +
#   ylab(label='Mean Completion Time (sec)') +
#   labs(color = "Technique") +
#   scale_x_discrete(expand = c(0.1,0.1)) +
#   scale_y_continuous(limits = c(0, 100)) +
#   scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
#                      values=c("#FF3300","#0066CC","#00F000"),
#                      labels=c("Small Multiples","Overlays","Shadow Marks")) +
#   new_theme +
#   theme(legend.position="bottom") +
#   guides(fill=guide_legend(title=NULL))
# 
# ggsave("task1/ct-per-trial-task1.png", width=20, height=20, units="cm", type="cairo-png")

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
  geom_col(fill=c("#FF3300","#0066CC","#00F000"), color="black", width=0.5) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  geom_label(aes(label = paste(round(mean,digits=2))), nudge_y = c(0.45,0.45,0.4), size = 4,
             label.size = 0, label.r = unit(0, "pt")) +
  new_theme +
  scale_x_discrete(limits=c("smallMultiples","overlays","shadowMarkers"),
                   labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  xlab(label='Technique') +
  ylab(label='Mean Errors per Trial')

ggsave("task1/acc-by-technique-task1.png", width=10, height=10, units="cm", type="cairo-png")

# ggplot(Data, aes(x=pID,y=errors, color=technique)) +
#   scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
#                      values=c("#FF3300","#0066CC","#00F000"),
#                      labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
#   geom_jitter(size=2.0) +
#   new_theme
# 
# ggsave("task1/acc-outliers.png", width=30, height=10, units="cm", type="cairo-png")

# accTrialSummary <- Data %>%
#   group_by(technique,trial) %>%
#   summarise(mean = mean(errors, na.rm = TRUE),
#             sd = sd(errors, na.rm = TRUE),
#             se = sd/sqrt(length(errors)))
# accTrialSummary
# 
# ggplot(accTrialSummary, aes(x=trial, y=mean, group=technique)) +
#   geom_line(aes(color=technique),size=1.5) +
#   geom_point(aes(color=technique),size=2)+
#   # geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
#   xlab(label='Trial') +
#   ylab(label='Mean Errors per Trial') +
#   labs(color = "Technique") +
#   scale_x_discrete(expand = c(0.1,0.1)) +
#   scale_y_continuous(limits = c(0, 4)) +
#   scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
#                      values=c("#FF3300","#0066CC","#00F000"),
#                      labels=c("Small Multiples","Overlays","Shadow Marks")) +
#   new_theme +
#   theme(legend.position="bottom") +
#   guides(fill=guide_legend(title=NULL))
# 
# ggsave("task1/acc-per-trial-task1.png", width=20, height=20, units="cm", type="cairo-png")

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
  group_by(technique) %>%
  summarise(mean = mean(difference, na.rm = TRUE),
            sd = sd(difference, na.rm = TRUE),
            se = sd/sqrt(length(difference)))
DifferenceData

ggplot(DifferenceData, aes(x=technique, y=mean)) +
  geom_col(fill=c("#FF3300","#0066CC","#00F000"), color="black", width=0.5) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  geom_label(aes(label = paste(round(mean,digits=2))), nudge_y = c(0.6,0.7,0.5), size = 4,
             label.size = 0, label.r = unit(0, "pt")) +
  new_theme +
  scale_x_discrete(limits=c("smallMultiples","overlays","shadowMarkers"),
                   labels=c("Small\nMultiples","Overlays","Shadow\nMarks")) +
  xlab(label='Technique') +
  ylab(label='Mean Error Distance (pixels)')

ggsave("task1/error-distance-by-technique-task1.png", width=10, height=10, units="cm", type="cairo-png")

# DifferenceData <- DataFull %>% filter(attempt==1) %>%
#   group_by(technique,trial) %>% 
#   summarise(mean=mean(difference,na.rm=TRUE),
#             sd=sd(difference,na.rm=TRUE),
#             se=sd/sqrt(length(difference)))
# DifferenceData

# ggplot(DifferenceData, aes(x=trial, y=mean, group=technique)) +
#   geom_line(aes(color=technique),size=1.5) +
#   geom_point(aes(color=technique),size=2)+
#   # geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
#   xlab(label='Trial') +
#   ylab(label='Mean Error Distance (pixels)') +
#   labs(color = "Technique") +
#   scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
#                      values=c("#FF3300","#0066CC","#00F000"),
#                      labels=c("Small Multiples","Overlays","Shadow Marks")) +
#   scale_x_discrete(expand = c(0.1,0.1)) +
#   scale_y_continuous(limits = c(0, 4)) +
#   new_theme +
#   theme(legend.position="bottom") +
#   guides(fill=guide_legend(title=NULL))
# 
# ggsave("task1/error-distance-per-trial-task1.png", width=20, height=20, units="cm", type="cairo-png")

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

tlxData$value[tlxData$question=="Performance"] <- 8-tlxData$value[tlxData$question=="Performance"]
tlxData

tlxData <- tlxData %>% filter(!(pID %in% incompletes)) %>%
  filter(!(pID %in% complete_outliers))

ezPrecis(tlxData)

ezDesign(data=tlxData, x=technique, y=pID)

tlxSummary <- tlxData %>% 
  group_by(technique,question) %>% 
  summarise(median = median(value, na.rm = TRUE),
            mean = mean(value, na.rm = TRUE),
            sd = sd(value, na.rm = TRUE),
            se = sd/sqrt(length(value)))
print(tlxSummary,n=30)

tlxSummary <- tlxData %>% 
  group_by(technique,question) %>% 
  summarise(median = median(value, na.rm = TRUE) - 1,
            mean = mean(value, na.rm = TRUE) - 1,
            sd = sd(value, na.rm = TRUE),
            se = sd/sqrt(length(value)))
tlxSummary

ggplot(data=tlxSummary, aes(x=question, y=mean, fill=technique)) +
  geom_col(position=position_dodge(width=0.8), color="black", width=0.7) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se),width=0.2,
                position=position_dodge(width=0.8)) +
  xlab(label='\nNASA TLX Question') +
  ylab(label='Mean Score') +
  scale_y_continuous(limits=c(0, 6), breaks=c(0,2,4,6),
                     labels=c("1    \n(least)", "3", "5", "7    \n(most)")) +
  scale_x_discrete(limits=c("MentalDemand","PhysicalDemand","TemporalDemand",
                            "Performance","Effort","Frustration"),
                   labels=c("Mental Demand \u2193","Physical Demand \u2193","Temporal Demand \u2193",
                            "Performance \u2191","Effort \u2193","Frustration \u2193")) +
  scale_fill_manual(limits=c("smallmultiples", "overlays", "shadowmarkers"),
                    values=c("#FF3300","#0066CC","#00F000"),
                    labels=c("Small Multiples","Overlays","Shadow Marks")) +
  new_theme +
  theme(legend.position="bottom",
        axis.title=element_text(size=24),
        axis.text=element_text(size=22),
        legend.text=element_text(size=22),
        axis.text.x=element_text(angle=30,hjust=0.95)) +
  guides(fill=guide_legend(title=NULL))

ggsave("task1/tlx-1.png", width=20, height=20, units="cm", type="cairo-png")

ggplot(data=tlxSummary, aes(x=question, y=mean, fill=technique)) +
  geom_col(position=position_dodge(width=0.8), color="black", width=0.7) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se),width=0.2,
                position=position_dodge(width=0.8)) +
  xlab(label='\nUX Question') +
  ylab(label='Mean Score') +
  scale_y_continuous(limits=c(0, 6), breaks=c(0,2,4,6),
                     labels=c("1    \n(least)", "3", "5", "7    \n(most)")) +
  scale_x_discrete(limits=c("Guessing","PerceivedAccuracy","TaskDifficulty",
                            "TechniqueDifficulty"),
                   labels=c("Guessing \u2193","Perceived Accuracy \u2191","Task Difficulty \u2193",
                            "Technique Difficulty \u2193")) +
  scale_fill_manual(limits=c("smallmultiples", "overlays", "shadowmarkers"),
                    values=c("#FF3300","#0066CC","#00F000"),
                    labels=c("Small Multiples","Overlays","Shadow Marks")) +
  new_theme +
  theme(legend.position="bottom",
        axis.title=element_text(size=24),
        axis.text=element_text(size=22),
        legend.text=element_text(size=22),
        axis.text.x=element_text(angle=30,hjust=0.95)) +
  guides(fill=guide_legend(title=NULL))

ggsave("task1/ux-1.png", width=20, height=20, units="cm", type="cairo-png")

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
preferenceData$question <- as_factor(preferenceData$question)
preferenceData$answer <- factor(preferenceData$answer, levels=c("Small Multiples","Overlays", "Shadow Marks"))

preferenceData <- preferenceData %>% filter(!(pID %in% incompletes)) %>%
  filter(!(pID %in% complete_outliers))

ezPrecis(preferenceData)

ezDesign(data=preferenceData, x=answer, y=pID)

preferenceSummary <- preferenceData %>%
  group_by(question,answer) %>%
  summarise(n = n())
preferenceSummary

ggplot(data=preferenceSummary, aes(x=question, y=n, fill=answer)) +
  geom_col(position=position_dodge(width=0.8), color="black", width=0.7) +
  geom_label(aes(label = paste(n)), nudge_x = c(-0.265,0,0.265), nudge_y = 2, size = 6,
             label.size = 0, label.r = unit(0, "pt"), fill="white") +
  scale_y_continuous(limits=c(0, 30), breaks=c(0,10,20,30)) +
  xlab(label='Preference Question') +
  ylab(label='Number of Participants') +
  scale_x_discrete(limits=c("speed","accuracy","preference"),
                   labels=c("Fastest","Most\nAccurate","Preferred\nOverall")) +
  scale_fill_manual(limits=c("Small Multiples", "Overlays", "Shadow Marks"),
                    values=c("#FF3300","#0066CC","#00F000"),
                    labels=c("Small Multiples","Overlays","Shadow Marks")) +
  new_theme +
  theme(legend.position="bottom",
        axis.title=element_text(size=24),
        axis.text=element_text(size=22),
        legend.text=element_text(size=22)) +
  guides(fill=guide_legend(title=NULL))

ggsave("task1/preference-1.png", width=20, height=20, units="cm", type="cairo-png")


preferenceData_speed <- preferenceData %>% filter(question=="speed")
preferenceData_accuracy <- preferenceData %>% filter(question=="accuracy")
preferenceData_preference <- preferenceData %>% filter(question=="preference")

test_speed <- chisq.test(table(preferenceData_speed$answer))
test_speed
test_speed$expected
table(preferenceData_speed$answer)

test_accuracy <- chisq.test(table(preferenceData_accuracy$answer))
test_accuracy
test_accuracy$expected
table(preferenceData_accuracy$answer)

test_preference <- chisq.test(table(preferenceData_preference$answer))
test_preference
test_preference$expected
table(preferenceData_preference$answer)

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

#
#  _______  _______  _______  _        _______ 
# (       )(  ____ \(  ___  )( (    /|(  ____ \
# | () () || (    \/| (   ) ||  \  ( || (    \/
# | || || || (__    | (___) ||   \ | || (_____ 
# | |(_)| ||  __)   |  ___  || (\ \) |(_____  )
# | |   | || (      | (   ) || | \   |      ) |
# | )   ( || (____/\| )   ( || )  \  |/\____) |
# |/     \|(_______/|/     \||/    )_)\_______)
#                                              
#

smallmultiples_Data <- Data %>% filter(technique=="smallMultiples")
overlays_Data <- Data %>% filter(technique=="overlays")
shadowmarks_Data <- Data %>% filter(technique=="shadowMarkers")

mean(smallmultiples_Data$elapsedTime)
mean(overlays_Data$elapsedTime)
mean(shadowmarks_Data$elapsedTime)

mean(smallmultiples_Data$errors)
mean(overlays_Data$errors)
mean(shadowmarks_Data$errors)

smallmultiples_Data <- attempt1Data %>% filter(technique=="smallMultiples")
overlays_Data <- attempt1Data %>% filter(technique=="overlays")
shadowmarks_Data <- attempt1Data %>% filter(technique=="shadowMarkers")

mean(smallmultiples_Data$difference)
mean(overlays_Data$difference)
mean(shadowmarks_Data$difference)