#========================================
# 0.0 Setup
#========================================

# if you haven't installed packages, do:
# install.packages("tidyverse")
# install.packages("ez")
# install.packages("ARTool")
# (or install these from the Tools menu)

# load packages
library(tidyverse)
library(ez)
library(ARTool)

# A nicer visual theme for charts

new_theme <- theme_bw(base_size = 16) +
  theme(panel.grid.major = element_line(linewidth=.5, color="#e0e0e0"),
        axis.line = element_line(linewidth=.7, color="#e0e0e0"),
        panel.border = element_rect(fill=NA, color="#e0e0e0"),
        plot.margin=unit(c(2,2,2,2),"mm"))

# Resources:
# https://www.tidyverse.org/
# https://r-graphics.org/
# https://modernstatisticswithr.com/

Data2 <- read_csv("shadowmarksTrialData_2024-08-15.csv", col_names=TRUE)
Data2

# ---------------------------------------
# 2.2: Check the data and reformat if needed
# ---------------------------------------

# ctData2 <- ctData2 %>% rename(interface = method)

Data2$pID <- as_factor(Data2$pID)
Data2$interaction <- as_factor(Data2$interaction)

Data2 <- Data2 %>% filter(trial!=0)
Data2

# Filtering out incompletes
incompletes <- list(3,23,43,53,68)
Data2 <- Data2 %>% filter(!(pID %in% incompletes))
ezDesign(data=Data2, x=interaction, y=pID)
ezPrecis(Data2)

Data2 <- Data2 %>% group_by(pID,interaction,task,trial) %>% summarise(elapsedTime=max(elapsedTime)/1000, errors=max(attempt)-1)
Data2

ctCap <- 180
accCap <- 12

# Filtering out outliers above elapsed time cap
nrow(Data2)
Data2 <- Data2 %>% filter(elapsedTime < ctCap)
nrow(Data2)
Data2

# Filtering out outliers above accuracy cap
nrow(Data2)
Data2 <- Data2 %>% filter(errors < accCap)
nrow(Data2)
Data2

complete_outliers <- list(2,7,31,32,47)

Data2 <- Data2 %>% filter(!(pID %in% complete_outliers))
ezDesign(data=Data2, x=interaction, y=pID)
ezPrecis(Data2)

# Data3 <- read_csv("shadowmarksTrialData_2024-08-14.csv", col_names=TRUE)
# Data3
# 
# Conditions <- Data3 %>% filter(attempt==1) %>% group_by(interaction,condition) %>% summarise(n=n())
# Conditions

ctData2 <- Data2
ctData2

accData2 <- Data2
accData2

# # Capping outliers above elapased time cap
# aboveCap <- ctData2$pID[ctData2$elapsedTime > ctCap]
# aboveCap
# ctData2$elapsedTime[ctData2$elapsedTime > ctCap] <- ctCap
# ctData2
# 
# # Capping outliers above accuracy cap
# aboveCap <- accData2$pID[accData2$errors > accCap]
# aboveCap
# accData2$errors[accData2$errors > accCap] <- accCap
# accData2

# ---------------------------------------
# 2.3 calculate summary stats by interface
# ---------------------------------------

#### Elapsed Time ####

ctSummary2 <- ctData2 %>%
  group_by(interaction) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctSummary2

ezPlot(ctData2, dv=elapsedTime, wid=pID, within=interaction, x=interaction)

ggplot(ctSummary2, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Completion Time (sec)')

ctData2_task1 <- ctData2 %>% filter(task==1)
ctData2_task2 <- ctData2 %>% filter(task==2)
ctData2_task3 <- ctData2 %>% filter(task==3)
ctData2_task4 <- ctData2 %>% filter(task==4)

ctSummaryTask1 <- ctData2_task1 %>%
  group_by(interaction) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctSummaryTask1

ctSummaryTask2 <- ctData2_task2 %>%
  group_by(interaction) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctSummaryTask2

ctSummaryTask3 <- ctData2_task3 %>%
  group_by(interaction) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctSummaryTask3

ctSummaryTask4 <- ctData2_task4 %>%
  group_by(interaction) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctSummaryTask4

ggplot(ctSummaryTask1, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Completion Time (sec)')

ggsave("ct-by-interaction-task1.png", width=20, height=10, units="cm", type="cairo-png")

ggplot(ctSummaryTask2, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Completion Time (sec)')

ggsave("ct-by-interaction-task2.png", width=20, height=10, units="cm", type="cairo-png")

ggplot(ctSummaryTask3, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Completion Time (sec)')

ggsave("ct-by-interaction-task3.png", width=20, height=10, units="cm", type="cairo-png")

ggplot(ctSummaryTask4, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Completion Time (sec)')

ggsave("ct-by-interaction-task4.png", width=20, height=10, units="cm", type="cairo-png")

ggplot(ctData2, aes(x=pID,y=elapsedTime, color=interaction)) +
  geom_jitter(size=2.0) +
  new_theme

ggsave("ct-outliers.png", width=30, height=10, units="cm", type="cairo-png")















#### ACCURACY #####

accSummary2 <- accData2 %>%
  group_by(interaction) %>%
  summarise(mean = mean(errors, na.rm = TRUE),
            sd = sd(errors, na.rm = TRUE),
            se = sd/sqrt(length(errors)))
accSummary2

ezPlot(accData2, dv=errors, wid=pID, within=interaction, x=interaction)

ggplot(accSummary2, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Completion Time (sec)')

accData2_task1 <- accData2 %>% filter(task==1)
accData2_task2 <- accData2 %>% filter(task==2)
accData2_task3 <- accData2 %>% filter(task==3)
accData2_task4 <- accData2 %>% filter(task==4)

accSummaryTask1 <- accData2_task1 %>%
  group_by(interaction) %>%
  summarise(mean = mean(errors, na.rm = TRUE),
            sd = sd(errors, na.rm = TRUE),
            se = sd/sqrt(length(errors)))
accSummaryTask1

accSummaryTask2 <- accData2_task2 %>%
  group_by(interaction) %>%
  summarise(mean = mean(errors, na.rm = TRUE),
            sd = sd(errors, na.rm = TRUE),
            se = sd/sqrt(length(errors)))
accSummaryTask2

accSummaryTask3 <- accData2_task3 %>%
  group_by(interaction) %>%
  summarise(mean = mean(errors, na.rm = TRUE),
            sd = sd(errors, na.rm = TRUE),
            se = sd/sqrt(length(errors)))
accSummaryTask3

accSummaryTask4 <- accData2_task4 %>%
  group_by(interaction) %>%
  summarise(mean = mean(errors, na.rm = TRUE),
            sd = sd(errors, na.rm = TRUE),
            se = sd/sqrt(length(errors)))
accSummaryTask4

ggplot(accSummaryTask1, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Accuracy (number of errors)')

ggsave("acc-by-interaction-task1.png", width=20, height=10, units="cm", type="cairo-png")

ggplot(accSummaryTask2, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Accuracy (number of errors)')

ggsave("acc-by-interaction-task2.png", width=20, height=10, units="cm", type="cairo-png")

ggplot(accSummaryTask3, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Accuracy (number of errors)')

ggsave("acc-by-interaction-task3.png", width=20, height=10, units="cm", type="cairo-png")

ggplot(accSummaryTask4, aes(x=interaction, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interaction') +
  ylab(label='Accuracy (number of errors)')

ggsave("acc-by-interaction-task4.png", width=20, height=10, units="cm", type="cairo-png")

ggplot(accData2, aes(x=pID,y=errors, color=interaction)) +
  geom_jitter(size=2.0) +
  new_theme

ggsave("acc-outliers.png", width=30, height=10, units="cm", type="cairo-png")



















### TLX DATA ###

tlxData <- read_csv("shadowmarksTLXData_2024-08-15.csv", col_names=TRUE)
tlxData

# ---------------------------------------
# 4.2: Check the data and reformat if needed
# ---------------------------------------

tlxData$pID <- as_factor(tlxData$pID)
tlxData$interaction <- as_factor(tlxData$interaction)

tlxData <- tlxData %>% filter(!(pID %in% incompletes)) %>%
  filter(!(pID %in% complete_outliers))

ezPrecis(tlxData)

ezDesign(data=tlxData, x=interaction, y=pID)

# ---------------------------------------
# 4.3 calculate summary stats for each ui and question
# ---------------------------------------

tlxSummary <- tlxData %>% 
  group_by(interaction,question) %>% 
  summarise(median = median(value, na.rm = TRUE) - 1,
            mean = mean(value, na.rm = TRUE) - 1,
            sd = sd(value, na.rm = TRUE),
            se = sd/sqrt(length(value)))
tlxSummary

ggplot(data=tlxSummary, aes(x=question, y=mean, fill=interaction)) +
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
                    labels=c("Small Multiples", "Overlays", "Shadow Marks")) +
  new_theme +
  theme(legend.position="bottom") +
  guides(fill=guide_legend(title=NULL))

ggsave("tlx-1.png", width=50, height=10, units="cm", type="cairo-png")
















#### Preference ####

preferenceData <- read_csv("shadowmarksPreferenceData_2024-08-15.csv", col_names=TRUE)
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
                    labels=c("Small Multiples", "Overlays", "Shadow Marks")) +
  new_theme +
  theme(legend.position="bottom") +
  guides(fill=guide_legend(title=NULL))

ggsave("preference-1.png", width=18, height=10, units="cm", type="cairo-png")














# ---------------------------------------
# 2.4 ANOVA: effect of interface on ct
# ---------------------------------------

ct_anova2 <- ezANOVA(data=ctData2, dv=ct, wid=id, within=.(interface),type=3, detailed=TRUE, return_aov=TRUE)
ct_anova2

# ---------------------------------------
# 2.5 Followup pairwise comparisons
# ---------------------------------------

pairwise.t.test(ctData2$ct, ctData2$interface, p.adj = "none")

pairwise.t.test(ctData2$ct, ctData2$interface, p.adj = "bonf")

pairwise.t.test(ctData2$ct, ctData2$interface, p.adj = "holm")

#========================================
# 2.6 Simple plot of the data
#========================================

ezPlot(ctData2, dv=ct, wid=id, within=interface, x=interface)

#========================================
# 2.7 Better plot using ggplot2
#========================================

ggplot(ctSummary2, aes(x=interface, y=mean)) +
  geom_col(fill="lightblue", colour="#808080") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2) +
  new_theme +
  xlab(label='Interface') +
  ylab(label='Completion Time (sec)')

ggsave("ct-by-interface-2.png", width=20, height=10, units="cm", type="cairo-png")




#========================================
# Example 3: two factors (device, task); DV=completion time
#========================================

# ---------------------------------------
# 3.1: Read the data from disk
# ---------------------------------------

ctData3 <- read_tsv("two-factor.log", col_names=TRUE)
ctData3
names(ctData3)

# ---------------------------------------
# 3.2: Check the data and reformat if needed
# ---------------------------------------

ezPrecis(ctData3)

ctData3$id <- as_factor(ctData3$id)
ctData3$device <- as_factor(ctData3$device)
ctData3$task <- as_factor(ctData3$task)

ezPrecis(ctData3)

ezDesign(data=ctData3, x=device, y=id)
ezDesign(data=ctData3, x=task, y=id)

# ---------------------------------------
# 3.3 calculate summary stats by device and task
# ---------------------------------------

ctSummary3 <- ctData3 %>% 
  group_by(device,task) %>% 
  summarise(mean = mean(ct, na.rm = TRUE),
            sd = sd(ct, na.rm = TRUE),
            se = sd/sqrt(length(ct)))
ctSummary3

# ---------------------------------------
# 3.4 ANOVA: effect of device and task on ct
# ---------------------------------------

ct_anova3 <- ezANOVA(data=ctData3, dv=ct, wid=id, within=.(device,task),type=3, detailed=TRUE, return_aov=TRUE)
ct_anova3

# ---------------------------------------
# 3.5 Followup pairwise comparisons
# ---------------------------------------

# note that we only do these on factor = device, because
# that factor showed a main effect; we do not do follow-ups
# on factor = task because there was no main effect.

pairwise.t.test(ctData3$ct, ctData3$device, p.adj = "none")

pairwise.t.test(ctData3$ct, ctData3$device, p.adj = "bonf")

pairwise.t.test(ctData3$ct, ctData3$device, p.adj = "holm")

#========================================
# 3.6 Plot using ggplot2
#========================================

# basic
ggplot(ctSummary3, aes(x=device, y=mean, fill=task)) +
  geom_col(position="dodge") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2, 
                position=position_dodge(width=0.9)) +
  new_theme +
  xlab(label='Device') +
  ylab(label='Completion Time (sec)')

# rename device labels
ctSummary3$device <- factor(ctSummary3$device, labels=c("Mouse","Trackpad","Joystick"))

# better colours with ColourBrewer
library(RColorBrewer)
display.brewer.all()

ggplot(ctSummary3, aes(x=device, y=mean, fill=task)) +
  geom_col(position="dodge") +
  scale_fill_brewer(palette = "Set1") +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), width = 0.2, 
                position=position_dodge(width=0.9)) +
  new_theme +
  xlab(label='Device') +
  ylab(label='Completion Time (sec)')

# could rename task labels like this:
ctSummary3$task <- factor(ctSummary3$task, labels=c("Pointing", "Docking"))
# but we can also do this by manipulating the chart

# custom colours and task labels and position for legend
ggplot(ctSummary3, aes(x=device, y=mean, fill=task)) +
  geom_col(position="dodge") +
  scale_fill_manual(values=c("#CCB24C", "#457D97"), labels=c("Pointing", "Docking")) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), 
                width = 0.2, position=position_dodge(width=0.9)) +
  xlab(label='Device') +
  ylab(label='Completion Time (sec)') +
  new_theme +
  theme(legend.position="bottom") +
  guides(fill=guide_legend(title="Task"))

# adding a custom Y axis scale
ggplot(ctSummary3, aes(x=device, y=mean, fill=task)) +
  geom_col(position="dodge") +
  scale_fill_manual(values=c("#CCB24C", "#457D97"), labels=c("Pointing", "Docking")) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se), 
                width = 0.2, position=position_dodge(width=0.9)) +
  scale_y_continuous(limits = c(0,20),breaks=c(0,2,4,6,8,10,12,14,16,18,20)) +
  xlab(label='Device') +
  ylab(label='Completion Time (sec)') +
  new_theme +
  theme(legend.position="bottom") +
  guides(fill=guide_legend(title="Task"))

ggsave("ct-by-device-and-task.png", width=20, height=10, units="cm", type="cairo-png")



#========================================
# Example 4: Questionnaire data (e.g., TLX)
#========================================

# ---------------------------------------
# 4.1: Read the data from disk
# ---------------------------------------

tlxRaw <- read_tsv("TLX-example-3.txt", col_names=TRUE)
tlxRaw

# ---------------------------------------
# 4.2: Check the data and reformat if needed
# ---------------------------------------

tlxRaw$id <- as_factor(tlxRaw$id)
tlxRaw$ui <- as_factor(tlxRaw$ui)

ezPrecis(tlxRaw)

ezDesign(data=tlxRaw, x=ui, y=id)

# The raw data has multiple DVs in each row
# We need to have only one observation per row
# Transform the data into tidy format:
#     Each variable is in a column.
#     Each observation is a row.

tlxData <- tlxRaw %>% gather(tlxQuestion, score, -id, -ui)
tlxData

# ---------------------------------------
# 4.3 calculate summary stats for each ui and question
# ---------------------------------------

tlxSummary <- tlxData %>% 
  group_by(ui,tlxQuestion) %>% 
  summarise(median = median(score, na.rm = TRUE) - 1,
            mean = mean(score, na.rm = TRUE) - 1,
            sd = sd(score, na.rm = TRUE),
            se = sd/sqrt(length(score)))
tlxSummary

# ---------------------------------------
# 4.4 Friedman tests and Wilcoxon followups
# ---------------------------------------

# use attach so we don't have to use the name of the 
# dataset in every variable name 
attach(tlxRaw)

tlxMental <- friedman.test(mental,ui,id)
tlxMental
tlxPhysical <- friedman.test(physical,ui,id)
tlxPhysical
tlxRushed <- friedman.test(rushed,ui,id)
tlxRushed
tlxSuccess <- friedman.test(success,ui,id)
tlxSuccess
tlxWork <- friedman.test(work,ui,id)
tlxWork
tlxAnnoyed <- friedman.test(annoyed,ui,id)
tlxAnnoyed

# if any are significant, we can do our followups 
# with the Wilcoxon and the "filter" command:

# filter(tlxData, ui=="Gestures", tlxQuestion=="mental")$score

wilcox.test(filter(tlxData, ui=="Gestures", tlxQuestion=="mental")$score,
            filter(tlxData, ui=="Menus", tlxQuestion=="mental")$score,
            paired = TRUE)

# repeat for other DVs

wilcox.test(filter(tlxData, ui=="Gestures", tlxQuestion=="physical")$score,
            filter(tlxData, ui=="Menus", tlxQuestion=="physical")$score,
            paired = TRUE)

# etc.

# ---------------------------------------
# 4.5 chart of means and s.e. for TLX
# ---------------------------------------

# We add a custom 1-7 scale and y-axis labels

ggplot(data=tlxSummary, aes(x=tlxQuestion, y=mean, fill=ui)) +
  geom_col(position=position_dodge(width=0.8), width=0.7) +
  geom_errorbar(aes(ymin=mean-se, ymax=mean+se),width=0.2,
                position=position_dodge(width=0.8)) +
  xlab(label='NASA TLX Question') +
  ylab(label='Mean Score') +
  scale_y_continuous(limits=c(0, 6), breaks=c(0,2,4,6),
                     labels=c("1 (least)", "3", "5", "7 (most)")) +
  scale_x_discrete(limits=c("mental","physical","rushed", 
                            "success", "work", "annoyed"),
                   labels=c("Mental\nEffort", "Physical\nEffort", 
                            "Rushed/\nHurried", "Perceived\nSuccess", 
                            "Hard Work\nRequired", 
                            "Annoyance/\nFrustration")) +
  scale_fill_manual(limits=c("Gestures", "Buttons", "Menus"),
                    values=c("#FF3300","#0066CC","#00F000"),
                    labels=c("Gesture UI", "Button UI", "Menu UI")) +
  new_theme +
  theme(legend.position="bottom") +
  guides(fill=guide_legend(title=NULL))

ggsave("tlx-1.png", width=18, height=10, units="cm", type="cairo-png")


# ---------------------------------------
# 4.6 Aligned Rank Transform for 2-factor analysis of TLX
# ---------------------------------------

# Can do one DV at a time
artResult <- art(score ~ ui + Error(id), data=filter(tlxData, tlxQuestion=="mental"))
summary(artResult)
tlxAnova <- anova(artResult)
tlxAnova

# followups if main effect was significant
art.con(artResult, "ui")

# all at once
tlxNames <- c("mental", "physical", "rushed", "success", "work", "annoyed")
for (name in tlxNames) {
  cat("\n\n---------------------------------\n")
  cat(name)
  cat("\n---------------------------------\n\n")
  tlxSingle <- filter(tlxData, tlxQuestion==name)
  artResult <- art(score ~ ui + Error(id), data=tlxSingle)
  print(summary(artResult))
  cat("\n----------\n")
  tlxAnova <- anova(artResult)
  print(tlxAnova)
  tlxFollowup <- art.con(artResult, "ui")
  print(tlxFollowup)
}

#===========================================================================
#===========================================================================
#===========================================================================
#===========================================================================
# Bootstrap test
#===========================================================================
#===========================================================================
#===========================================================================
#===========================================================================

library(boot)
set.seed(42)
bs <- boot(iris,mean(data),R=1000)





























ctSummary2 <- ctData2 %>%
  group_by(interaction) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctSummary2

ctData2_task4 <- ctData2 %>% filter(task==4)

ctSummaryTask4 <- ctData2_task4 %>%
  group_by(interaction, trial) %>%
  summarise(mean = mean(elapsedTime, na.rm = TRUE),
            sd = sd(elapsedTime, na.rm = TRUE),
            se = sd/sqrt(length(elapsedTime)))
ctSummaryTask4

ggplot(ctSummaryTask4, aes(x=trial, y=mean, group=interaction)) +
  geom_line(aes(color=interaction)) +
  geom_point(aes(color=interaction))+
  xlab(label='Trial') +
  ylab(label='Completion Time (sec)') +
  scale_x_discrete(limits=c(0,1,2),
                   labels=c("1","2","3")) +
  scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
                     values=c("#FF3300","#0066CC","#00F000"),
                     labels=c("Small Multiples", "Overlays", "Shadow Marks")) +
  new_theme +
  theme(legend.position="right") +
  guides(fill=guide_legend(title=NULL))

ggsave("ct-lines.png", width=30, height=10, units="cm", type="cairo-png")



StreamData2 <- read_csv("shadowmarksStreamData_2024-08-14.csv", col_names=TRUE)
StreamData2

complete_outliers <- list(25,35,67,55,44,42,24,15,13)

StreamData2 <- StreamData2 %>% filter(!(pID %in% complete_outliers)) %>%
  filter(event=="submit") %>% group_by(pID,condition,interaction,trial,attempt,selectedVideos) %>% summarise()

Data2 <- read_csv("shadowmarksTrialData_2024-08-14.csv", col_names=TRUE)
Data2

complete_outliers <- list(25,35,67,55,44,42,24,15,13)

Data2 <- Data2 %>% filter(!(pID %in% complete_outliers)) %>%
  group_by(pID,condition,interaction,trial,attempt,videos) %>% summarise()

DataMerge <- merge(StreamData2, Data2, by=c("pID","condition","interaction","trial","attempt"))

write.csv(DataMerge, "selected_videos.csv")

StreamData2 <- StreamData2 %>% filter(!(trial==0)) %>%
  filter(attempt==1)
StreamData2

StreamData2_cursormove <- StreamData2 %>% filter(event=="shadow_cursor_moved") %>%
  group_by(pID) %>% summarise(n=n())
StreamData2_cursormove

StreamData2_addedmark <- StreamData2 %>% filter(event=="added_mark") %>%
  group_by(pID) %>% summarise(n=n())
StreamData2_addedmark

DifferenceData2 <- read_csv("difference_to_selection.csv", col_names=TRUE)
DifferenceData2

complete_outliers <- list(25,35,67,55,44,42,24,15,13)

DifferenceData2 <- DifferenceData2 %>% filter(!(pID %in% complete_outliers)) %>%
  group_by(interaction,trial) %>% summarise(mean=mean(difference,na.rm=TRUE),
                                            sd=sd(difference,na.rm=TRUE),
                                            se=sd/sqrt(length(difference)))

ggplot(DifferenceData2, aes(x=trial, y=mean, group=interaction)) +
  geom_line(aes(color=interaction)) +
  geom_point(aes(color=interaction))+
  xlab(label='Trial') +
  ylab(label='Mean distance to correct answer') +
  scale_x_discrete(limits=c(0,1,2),
                   labels=c("1","2","3")) +
  scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
                     values=c("#FF3300","#0066CC","#00F000"),
                     labels=c("Small Multiples", "Overlays", "Shadow Marks")) +
  new_theme +
  theme(legend.position="right") +
  guides(fill=guide_legend(title=NULL))

ggsave("difference_to_selection.png", width=30, height=10, units="cm", type="cairo-png")




accData2_task4 <- accData2 %>% filter(task==4)

accSummaryTask4 <- accData2_task4 %>%
  group_by(interaction,trial) %>%
  summarise(mean = mean(errors, na.rm = TRUE),
            sd = sd(errors, na.rm = TRUE),
            se = sd/sqrt(length(errors)))
accSummaryTask4

ggplot(accSummaryTask4, aes(x=trial, y=mean, group=interaction)) +
  geom_line(aes(color=interaction)) +
  geom_point(aes(color=interaction))+
  xlab(label='Trial') +
  ylab(label='Accuracy (# of errors)') +
  scale_x_discrete(limits=c(0,1,2),
                   labels=c("1","2","3")) +
  scale_color_manual(limits=c("smallMultiples", "overlays", "shadowMarkers"),
                     values=c("#FF3300","#0066CC","#00F000"),
                     labels=c("Small Multiples", "Overlays", "Shadow Marks")) +
  new_theme +
  theme(legend.position="right") +
  guides(fill=guide_legend(title=NULL))

ggsave("acc-lines.png", width=20, height=10, units="cm", type="cairo-png")

